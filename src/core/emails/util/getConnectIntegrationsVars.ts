import { FilterQuery } from '@mikro-orm/core';

import { APP, IntegrationsBrand, KeyValue } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Community, CommunityIntegrations, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface ConnectIntegrationsContext {
  brand: IntegrationsBrand;
  communityId?: string;
  urlName?: string;
}

export interface ConnectIntegrationsVars {
  brand: IntegrationsBrand;
  community: Pick<Community, 'name'>;
  details: KeyValue[];
  integrationsUrl: string;
  user: Pick<User, 'email' | 'firstName'>;
}

const getConnectIntegrationsVars = async (
  context: EmailContext
): Promise<ConnectIntegrationsVars[]> => {
  const { brand, communityId, urlName } = context as ConnectIntegrationsContext;

  const bm = new BloomManager();

  const communityArgs: FilterQuery<Community> = communityId
    ? { id: communityId }
    : { urlName };

  const [community, integrations, users]: [
    Community,
    CommunityIntegrations,
    User[]
  ] = await Promise.all([
    bm.findOne(Community, { ...communityArgs }, { fields: ['name'] }),
    bm.findOne(CommunityIntegrations, { community: { ...communityArgs } }),
    bm.find(
      User,
      { members: { community: { ...communityArgs }, role: { $ne: null } } },
      { fields: ['firstName', 'email'] }
    )
  ]);

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

  const integrationsUrl = `${APP.CLIENT_URL}/${community.urlName}/integrations`;

  const variables: ConnectIntegrationsVars[] = users.map((user: User) => {
    return { brand, community, details, integrationsUrl, user };
  });

  return variables;
};

export default getConnectIntegrationsVars;
