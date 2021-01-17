import { GQLContext, QueryEvent } from '@constants';

export const getMemberInformationCacheKeys = ({
  communityId,
  userId
}: Pick<GQLContext, 'communityId' | 'userId'>) => {
  return [
    `${QueryEvent.GET_DATABASE}-${communityId}`,
    `${QueryEvent.GET_DIRECTORY}-${communityId}`,
    `${QueryEvent.GET_USER}-${userId}`
  ];
};

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
