import { ArgsType, Field } from 'type-graphql';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { PopulateArgs } from '@util/gql.types';
import Event from '../Event';

@ArgsType()
export class GetEventArgs extends PopulateArgs {
  @Field()
  eventId: string;
}

const getEvent = async ({ eventId, populate }: GetEventArgs) => {
  return new BloomManager().findOne(
    Event,
    { id: eventId },
    { cacheKey: `${QueryEvent.GET_EVENT}-${eventId}`, populate }
  );
};

export default getEvent;
