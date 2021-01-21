import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventGuest from '../EventGuest';

@ArgsType()
export class CreateEventGuestArgs {
  @Field()
  eventId: string;
}

const createEventGuest = async (
  { eventId }: CreateEventGuestArgs,
  { memberId }: Pick<GQLContext, 'memberId'>
) => {
  const bm = new BloomManager();

  const guest: EventGuest = bm.create(EventGuest, {
    event: { id: eventId },
    member: { id: memberId }
  });

  await bm.flush({ event: 'CREATE_EVENT_GUEST' });

  return guest;
};

export default createEventGuest;
