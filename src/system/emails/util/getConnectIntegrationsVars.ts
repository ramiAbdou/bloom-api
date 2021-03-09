import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Community from '@entities/community/Community';
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

  const [community, communityIntegrations, members]: [
    Community,
    CommunityIntegrations,
    Member[]
  ] = await Promise.all([
    bm.findOne(
      Community,
      { ...communityArgs },
      { fields: ['name', 'urlName'] }
    ),
    bm.findOne(CommunityIntegrations, { community: { ...communityArgs } }),
    bm.find(
      Member,
      { community: { ...communityArgs }, role: { $ne: null } },
      { fields: ['firstName', 'email'] }
    )
  ]);

  let details: KeyValue[] = [];

  if (brand === IntegrationsBrand.MAILCHIMP) {
    details = [
      {
        key: 'Mailchimp List',
        value: await communityIntegrations.mailchimpListName()
      },
      { key: 'Mailchimp List ID', value: communityIntegrations.mailchimpListId }
    ];
  }

  if (brand === IntegrationsBrand.STRIPE) {
    details = [
      { key: 'Stripe Account ID', value: communityIntegrations.stripeAccountId }
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
