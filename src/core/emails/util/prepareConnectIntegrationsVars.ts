import { APP, IntegrationsBrand, KeyValue } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import { Community } from '@entities/entities';
import Member from '@entities/member/Member';
import User from '@entities/user/User';
import { EmailsContext } from '../emails.types';

export interface ConnectIntegrationsContext {
  brand: IntegrationsBrand;
  urlName: string;
}

export interface ConnectIntegrationsVars {
  brand: IntegrationsBrand;
  community: Pick<Community, 'name'>;
  details: KeyValue[];
  integrationsUrl: string;
  user: Pick<User, 'email' | 'firstName'>;
}

const prepareConnectIntegrationsVars = async (
  context: EmailsContext
): Promise<ConnectIntegrationsVars[]> => {
  const { brand, urlName } = context as ConnectIntegrationsContext;

  const bm = new BloomManager();

  const [admins, community, integrations]: [
    Member[],
    Community,
    CommunityIntegrations
  ] = await Promise.all([
    bm.find(
      Member,
      { community: { urlName }, role: { $ne: null } },
      { fields: [{ user: ['email', 'firstName'] }] }
    ),
    bm.findOne(Community, { urlName }, { fields: ['name'] }),
    bm.findOne(CommunityIntegrations, { community: { urlName } })
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

  const integrationsUrl = `${APP.CLIENT_URL}/${urlName}/integrations`;

  const variables: ConnectIntegrationsVars[] = admins.map((admin: Member) => {
    return { brand, community, details, integrationsUrl, user: admin.user };
  });

  console.log(variables);

  return variables;
};

export default prepareConnectIntegrationsVars;
