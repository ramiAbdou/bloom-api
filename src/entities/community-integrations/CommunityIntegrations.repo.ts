/**
 * @fileoverview Repository: CommunityIntegrations
 * @author Rami Abdou
 */

import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';

import { APP, Event, isProduction } from '@constants';
import { Community, Membership } from '@entities';
import logger from '@logger';
import cache from '@util/cache';
import BaseRepo from '@util/db/BaseRepo';
import CommunityIntegrations from './CommunityIntegrations';

export default class CommunityIntegrationsRepo extends BaseRepo<
  CommunityIntegrations
> {
  /**
   * Returns the updated community after updating it's Mailchimp token. If
   * no community was found based on the encodedUrlName, returns null.
   *
   * Precondition: The community ID must represent a community.
   */
  storeMailchimpTokenFromCode = async (
    encodedUrlName: string,
    code: string
  ): Promise<void> => {
    const integrations: CommunityIntegrations = await this.findOne(
      { community: { encodedUrlName } },
      ['community']
    );

    // All the other redirect URIs use localhost when in development, but
    // Mailchimp forces us to use 127.0.0.1 instead, so we can't use the
    // APP.SERVER_URL local URL.
    const BASE_URI = isProduction ? APP.SERVER_URL : 'http://127.0.0.1:8080';

    const options: AxiosRequestConfig = {
      data: new URLSearchParams({
        client_id: process.env.MAILCHIMP_CLIENT_ID,
        client_secret: process.env.MAILCHIMP_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${BASE_URI}/mailchimp/auth`
      }),
      method: 'POST',
      url: 'https://login.mailchimp.com/oauth2/token'
    };

    const {
      data: { access_token: token }
    } = await axios(options);

    integrations.mailchimpAccessToken = token;
    await this.flush('MAILCHIMP_TOKEN_STORED', integrations);

    // Invalidate the cache for the GET_APPLICANTS call.
    cache.invalidateEntries(
      `${Event.GET_INTEGRATIONS}-${integrations.community.id}`,
      true
    );
  };

  /**
   * Stores the Mailchimp list ID that we use for adding new members to the
   * listserv.
   */
  updateMailchimpListId = async (
    communityId: string,
    mailchimpListId: string
  ) => {
    const integrations: CommunityIntegrations = await this.findOne({
      community: { id: communityId }
    });

    integrations.mailchimpListId = mailchimpListId;
    await this.flush('MAILCHIMP_LIST_STORED', integrations);

    // Invalidate the cache for the GET_APPLICANTS call.
    cache.invalidateEntries(
      `${Event.GET_INTEGRATIONS}-${integrations.community.id}`,
      true
    );
  };

  /**
   * Adds all of the users associated with the memberships to the Mailchimp
   * audience stored in the community.
   */
  addToMailchimpAudience = async (
    memberships: Membership[],
    community: Community
  ) => {
    const { mailchimpAccessToken, mailchimpListId } = community.integrations;

    // Format the data that we send to Mailchimp to add users to the audience.
    const members = memberships.map(({ user }) => ({
      email_address: user.email,
      merge_fields: { F_NAME: user.firstName, L_NAME: user.lastName },
      status: 'subscribed'
    }));

    const options: AxiosRequestConfig = {
      data: { members },
      headers: { Authorization: `OAuth ${mailchimpAccessToken}` },
      method: 'POST',
      url: `https://us2.api.mailchimp.com/3.0/lists/${mailchimpListId}`
    };

    await axios(options);
    logger.info('MAILCHIMP_LIST_MEMBERS_ADDED');
  };
}
