import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import EventGuest from './EventGuest';
import createEventGuest, {
  CreateEventGuestArgs
} from './repo/createEventGuest';
import deleteEventGuest, {
  DeleteEventGuestArgs
} from './repo/deleteEventGuest';

@Resolver()
export default class EventGuestResolver {
  @Authorized()
  @Mutation(() => EventGuest, { nullable: true })
  async createEventGuest(
    @Args() args: CreateEventGuestArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventGuest> {
    return createEventGuest(args, ctx);
  }

  @Authorized()
  @Mutation(() => Boolean, { nullable: true })
  async deleteEventGuest(
    @Args() args: DeleteEventGuestArgs,
    @Ctx() ctx: GQLContext
  ): Promise<boolean> {
    return deleteEventGuest(args, ctx);
  }
}
