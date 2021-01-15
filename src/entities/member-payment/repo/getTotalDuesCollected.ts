import day from 'dayjs';
import { Field, ObjectType } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import MemberPayment from '../MemberPayment';

@ObjectType()
export class GetTotalDuesCollectedResult {
  // Total amount of dues collected in last 365 days.
  @Field(() => Number)
  amount: number;

  @Field(() => Number)
  percentage: number;
}

export default async ({
  communityId
}: GQLContext): Promise<GetTotalDuesCollectedResult> => {
  const cacheKey = `${QueryEvent.GET_TOTAL_DUES_COLLECTED}-${communityId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bm = new BloomManager();

  const startOfToday = day.utc().endOf('day');

  const paymentsBeforeYearAgo = await bm.find(
    MemberPayment,
    {
      community: { id: communityId },
      createdAt: { $lt: startOfToday.subtract(1, 'year').format() }
    },
    { orderBy: { createdAt: QueryOrder.ASC } }
  );

  const paymentsAfterYearAgo = await bm.find(
    MemberPayment,
    {
      community: { id: communityId },
      createdAt: { $gte: startOfToday.subtract(1, 'year').format() }
    },
    { orderBy: { createdAt: QueryOrder.ASC } }
  );

  const amountBeforeYearAgo =
    paymentsBeforeYearAgo.reduce((acc: number, payment: MemberPayment) => {
      return acc + payment.amount;
    }, 0) / 100;

  const amount =
    paymentsAfterYearAgo.reduce((acc: number, payment: MemberPayment) => {
      return acc + payment.amount;
    }, 0) / 100;

  const percentage =
    (amount + amountBeforeYearAgo) / (amountBeforeYearAgo || 1);

  const result: GetTotalDuesCollectedResult = { amount, percentage };
  cache.set(cacheKey, result);
  return result;
};
