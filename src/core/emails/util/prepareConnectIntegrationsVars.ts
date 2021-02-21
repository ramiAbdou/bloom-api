import { FilterQuery } from '@mikro-orm/core';

import { APP, IntegrationsBrand, KeyValue } from '@constants';
import BloomManager from '@core/db/BloomManager';
import {
  Community,
  CommunityIntegrations,
  Member,
  User
} from '@entities/entities';
import { EmailsContext } from '../emails.types';

export interface ConnectIntegrationsEmailContext {
  brand: IntegrationsBrand;
  communityId?: string;
  urlName?: string;
}

export interface ConnectIntegrationsEmailVars {
  brand: IntegrationsBrand;
  community: Pick<Community, 'name'>;
  details: KeyValue[];
  integrationsUrl: string;
  user: Pick<User, 'email' | 'firstName'>;
}

const prepareConnectIntegrationsVars = async (
  context: EmailsContext
): Promise<ConnectIntegrationsEmailVars[]> => {
  const {
    brand,
    communityId,
    urlName
  } = context as ConnectIntegrationsEmailContext;

  const bm = new BloomManager();

  const communityArgs: FilterQuery<Community> = communityId
    ? { id: communityId }
    : { urlName };

  const [admins, community, integrations]: [
    Member[],
    Community,
    CommunityIntegrations
  ] = await Promise.all([
    bm.find(
      Member,
      { community: { ...communityArgs }, role: { $ne: null } },
      { fields: [{ user: ['email', 'firstName'] }] }
    ),
    bm.findOne(Community, { ...communityArgs }, { fields: ['name'] }),
    bm.findOne(CommunityIntegrations, { community: { ...communityArgs } })
  ]);

  console.log('admins', admins);

  let details: KeyValue[] = [];

  if (brand === IntegrationsBrand.MAILCHIMP) {
    details = [
      { key: 'Mailchimp List', value: await integrations.mailchimpListName() },
      { key: 'Mailchimp List ID', value: integrations.mailchimpListId }
    ];
  }

  if (brand === IntegrationsBrand.STRIPE) {
    details = [
      { key: 'Stripe Account ID', value: integrations.stripeAccountId }
    ];
  }

  const integrationsUrl = `${APP.CLIENT_URL}/${urlName}/integrations`;

  const variables: ConnectIntegrationsEmailVars[] = admins.map(
    (admin: Member) => {
      return { brand, community, details, integrationsUrl, user: admin.user };
    }
  );

  console.log('variables', variables);

  return variables;
};

export default prepareConnectIntegrationsVars;
