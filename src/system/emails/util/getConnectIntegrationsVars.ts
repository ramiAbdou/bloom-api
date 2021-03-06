import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Integrations from '@entities/integrations/Integrations';
import Member from '@entities/member/Member';
import { APP, IntegrationsBrand, KeyValue } from '@util/constants';
import { EmailPayload } from '../emails.types';

export interface ConnectIntegrationsPayload {
  brand: IntegrationsBrand;
  communityId?: string;
  urlName?: string;
}

export interface ConnectIntegrationsVars {
  brand: IntegrationsBrand;
  community: Pick<Community, 'name'>;
  details: KeyValue[];
  integrationsUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getConnectIntegrationsVars = async (
  context: EmailPayload
): Promise<ConnectIntegrationsVars[]> => {
  const { brand, communityId, urlName } = context as ConnectIntegrationsPayload;

  const bm = new BloomManager();

  const communityArgs: FilterQuery<Community> = communityId
    ? { id: communityId }
    : { urlName };

  const [community, integrations, members]: [
    Community,
    Integrations,
    Member[]
  ] = await Promise.all([
    bm.findOne(
      Community,
      { ...communityArgs },
      { fields: ['name', 'urlName'] }
    ),
    bm.findOne(Integrations, { community: { ...communityArgs } }),
    bm.find(
      Member,
      { community: { ...communityArgs }, role: { $ne: null } },
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

  const partialVars: Pick<
    ConnectIntegrationsVars,
    'brand' | 'details' | 'integrationsUrl'
  > = {
    brand,
    details,
    integrationsUrl
  };

  const variables: ConnectIntegrationsVars[] = members.map((member: Member) => {
    return { ...partialVars, community, member };
  });

  return variables;
};

export default getConnectIntegrationsVars;
