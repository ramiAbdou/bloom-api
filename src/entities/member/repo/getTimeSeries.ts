import day from 'dayjs';
import { Field, ObjectType } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ObjectType()
export class TimeSeriesData {
  @Field({ nullable: true })
  name: string;

  @Field()
  value: number;
}

export default async ({
  communityId
}: GQLContext): Promise<TimeSeriesData[]> => {
  const bm = new BloomManager();
  const memberRepo = bm.memberRepo();

  const endOfToday = day.utc().endOf('day');

  const dataSeries: any[] = Array.from(Array(120).keys()).reduce(
    (acc: any[], curr: number) => {
      const dateKey = endOfToday.subtract(120 - curr - 1, 'd').format();
      return [...acc, { name: dateKey, value: 0 }];
    },
    []
  );

  const members = await memberRepo.find(
    { community: { id: communityId } },
    { filters: false }
  );

  members.forEach(({ createdAt, deletedAt }: Member) => {
    const createdAtObject = day.utc(createdAt);
    const deletedAtObject = deletedAt ? day.utc(deletedAt) : null;

    let markedCreated = false;

    dataSeries.some(({ name }, i: number) => {
      if (createdAtObject.isBefore(day.utc(name))) {
        dataSeries[i].value++;
        if (!deletedAtObject) return true;
        markedCreated = true;
      }

      if (markedCreated && deletedAtObject.isBefore(day.utc(name))) {
        dataSeries[i].value--;
        return true;
      }

      return false;
    });

    //
  });

  return dataSeries.reduce(
    (acc: TimeSeriesData[], { name, value }: TimeSeriesData, i: number) => {
      const updatedValue = !i ? value : acc[i - 1].value + value;
      return [...acc, { name, value: updatedValue }];
    },
    []
  );
};
