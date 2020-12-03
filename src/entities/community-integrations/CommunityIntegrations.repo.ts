import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';
import { URLSearchParams } from 'url';

import { APP, AuthTokens, Event, isProduction } from '@constants';
import cache from '@core/cache';
import BaseRepo from '@core/db/BaseRepo';
import logger from '@core/logger';
import { Community, Membership } from '@entities';
import { stripe } from '@integrations/stripe/Stripe.util';
import CommunityIntegrations from './CommunityIntegrations';

type RefreshZoomTokensArgs = {
  communityId?: string;
  integrations?: CommunityIntegrations;
};

export default class CommunityIntegrationsRepo extends BaseRepo<
  CommunityIntegrations
> {
  // ## MAILCHIMP

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

    const { data } = await axios(options);

    integrations.mailchimpAccessToken = data?.access_token;
    await this.flush('MAILCHIMP_TOKEN_STORED', integrations);

    // Invalidate the cache for the GET_INTEGRATIONS call.
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
  ): Promise<CommunityIntegrations> => {
    const integrations: CommunityIntegrations = await this.findOne({
      community: { id: communityId }
    });

    integrations.mailchimpListId = mailchimpListId;
    await this.flush('MAILCHIMP_LIST_STORED', integrations);

    // Invalidate the cache for the GET_INTEGRATIONS call.
    cache.invalidateEntries(
      `${Event.GET_INTEGRATIONS}-${integrations.community.id}`,
      true
    );

    return integrations;
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

  // ## ZOOM

  /**
   * Stores the Zoom tokens in the database after executing the
   * OAuth token flow, and returns the community following execution.
   *
   * @param code Zoom's API produced authorization code that we exchange for
   * tokens.
   */
  storeZoomTokensFromCode = async (
    encodedUrlName: string,
    code: string
  ): Promise<void> => {
    const integrations: CommunityIntegrations = await this.findOne(
      { community: { encodedUrlName } },
      ['community']
    );

    // Create the Base64 token from the Zoom client and secret.
    const base64Token = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');

    const options: AxiosRequestConfig = {
      headers: { Authorization: `Basic ${base64Token}` },
      method: 'POST',
      params: {
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${APP.SERVER_URL}/zoom/auth`
      },
      url: 'https://zoom.us/oauth/token'
    };

    const { data } = await axios(options);

    integrations.zoomAccessToken = data?.access_token;

    integrations.zoomExpiresAt = moment
      .utc()
      .add(data?.expires_in, 'seconds')
      .format();

    integrations.zoomRefreshToken = data?.refresh_token;

    await this.flush('ZOOM_TOKENS_STORED', integrations);

    // Invalidate the cache for the GET_INTEGRATIONS call.
    cache.invalidateEntries(
      `${Event.GET_INTEGRATIONS}-${integrations.community.id}`,
      true
    );
  };

  /**
   * Refreshes the Zoom tokens for the community with the following ID.
   *
   * Precondition: A zoomRefreshToken must already exist in the Community.
   */
  refreshZoomTokens = async ({
    communityId,
    integrations
  }: RefreshZoomTokensArgs): Promise<AuthTokens> => {
    integrations =
      integrations ?? (await this.findOne({ community: { id: communityId } }));

    // We don't need to run the refresh flow if the token hasn't expired yet.
    if (moment.utc().isBefore(moment.utc(integrations.zoomExpiresAt)))
      return {
        accessToken: integrations.zoomAccessToken,
        refreshToken: integrations.zoomRefreshToken
      };

    // Create the Base64 token from the Zoom client and secret.
    const base64Token = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');

    const options: AxiosRequestConfig = {
      headers: { Authorization: `Basic ${base64Token}` },
      method: 'POST',
      params: {
        grant_type: 'refresh_token',
        refresh_token: integrations.zoomRefreshToken
      },
      url: 'https://zoom.us/oauth/token'
    };

    const { data } = await axios(options);

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn
    } = data;

    integrations.zoomAccessToken = accessToken;

    integrations.zoomExpiresAt = moment
      .utc()
      .add(expiresIn, 'seconds')
      .format();

    integrations.zoomRefreshToken = refreshToken;

    await this.flush('ZOOM_TOKENS_REFRESHED', integrations);
    return { accessToken, refreshToken };
  };

  // ## STRIPE

  /**
   * Stores the Stripe tokens in the database after executing the
   * OAuth token flow.
   *
   * @param code Stripe's API produced authorization code that we exchange for
   * tokens.
   */
  storeStripeTokensFromCode = async (
    encodedUrlName: string,
    code: string
  ): Promise<void> => {
    const integrations: CommunityIntegrations = await this.findOne(
      { community: { encodedUrlName } },
      ['community']
    );

    const { stripe_user_id } = await stripe.oauth.token({
      code,
      grant_type: 'authorization_code'
    });

    integrations.stripeAccountId = stripe_user_id;
    await this.flush('STRIPE_ACCOUNT_STORED', integrations);

    // Invalidate the cache for the GET_INTEGRATIONS call.
    cache.invalidateEntries(
      `${Event.GET_INTEGRATIONS}-${integrations.community.id}`,
      true
    );
  };
}
