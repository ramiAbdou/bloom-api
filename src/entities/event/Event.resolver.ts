import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import Event from './Event';
import createEvent, { CreateEventArgs } from './repo/createEvent';
import deleteEvent, { DeleteEventArgs } from './repo/deleteEvent';

@Resolver()
export default class EventResolver {
  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Event, { nullable: true })
  async createEvent(
    @Args() args: CreateEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Event> {
    return createEvent(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Event)
  async deleteEvent(
    @Args() args: DeleteEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Event> {
    return deleteEvent(args, ctx);
  }
}
