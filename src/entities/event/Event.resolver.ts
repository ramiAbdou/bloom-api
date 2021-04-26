import { GraphQLResolveInfo } from 'graphql';
import { Info, Query, Resolver } from 'type-graphql';

import resolveFind from '../../core/resolveFind';
import Event from './Event';

@Resolver()
export default class EventResolver {
  @Query(() => [Event])
  async getEvents(@Info() info: GraphQLResolveInfo): Promise<Event[]> {
    return resolveFind(Event, { info });
  }
}
