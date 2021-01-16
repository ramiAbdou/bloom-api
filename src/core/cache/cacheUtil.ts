import { GQLContext, QueryEvent } from '@constants';

export const getMemberInformationCacheKeys = () => {};

export const getPaymentCacheKeys = ({
  communityId,
  memberId
}: Pick<GQLContext, 'communityId' | 'memberId'>) => {
  const memberEvents = memberId
    ? [`${QueryEvent.GET_PAYMENT_HISTORY}-${memberId}`]
    : [];

  return [
    ...memberEvents,
    `${QueryEvent.GET_ACTIVE_DUES_GROWTH}-${communityId}`,
    `${QueryEvent.GET_PAYMENTS}-${communityId}`,
    `${QueryEvent.GET_TOTAL_DUES_COLLECTED}-${communityId}`,
    `${QueryEvent.GET_TOTAL_DUES_GROWTH}-${communityId}`,
    `${QueryEvent.GET_TOTAL_DUES_SERIES}-${communityId}`
  ];
};
