/* eslint-disable import/prefer-default-export */

import { GQLContext, QueryEvent } from '@constants';

export const getPaymentCacheKeys = ({
  communityId,
  memberId
}: Pick<GQLContext, 'communityId' | 'memberId'>) => {
  const memberEvents = memberId
    ? [`${QueryEvent.GET_MEMBER_PAYMENTS}-${memberId}`]
    : [];

  return [
    ...memberEvents,
    `${QueryEvent.GET_ACTIVE_DUES_GROWTH}-${communityId}`,
    `${QueryEvent.GET_DATABASE}-${communityId}`,
    `${QueryEvent.GET_PAYMENTS}-${communityId}`,
    `${QueryEvent.GET_TOTAL_DUES_COLLECTED}-${communityId}`,
    `${QueryEvent.GET_TOTAL_DUES_GROWTH}-${communityId}`,
    `${QueryEvent.GET_TOTAL_DUES_SERIES}-${communityId}`
  ];
};
