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
  const [guest] = await new BloomManager().findOneOrCreateAndFlush(
    EventGuest,
    { event: { id: eventId }, member: { id: memberId } },
    { event: { id: eventId }, member: { id: memberId } },
    { event: 'CREATE_EVENT_GUEST', populate: ['member.user'] }
  );

  return guest;
};

export default createEventGuest;
