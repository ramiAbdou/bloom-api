import { Args, Query, Resolver } from 'type-graphql';

import Application from './Application';
import getApplication, { GetApplicationArgs } from './repo/getApplication';

@Resolver()
export default class ApplicationResolver {
  @Query(() => Application)
  async getApplication(@Args() args: GetApplicationArgs): Promise<Application> {
    return getApplication(args);
  }
}
