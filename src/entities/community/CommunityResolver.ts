/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Arg, Query, Resolver } from 'type-graphql';

import bloomManager from '@bloomManager';
import { Community, FormItem } from '@entities';
import GetSignupFormObject from './GetSignupFormObject';

@Resolver()
export default class CommunityResolver {
  /**
   * Returns the community's signup form data.
   */
  @Query(() => GetSignupFormObject)
  async getSignupForm(@Arg('communityName') communityName: string) {
    const bm = bloomManager.fork();

    const populate = [
      'membershipForm.items.options',
      'membershipForm.items.type',
      'membershipTypes'
    ];

    // Fetch the community by the lowercase name.
    const community: Community = await bm
      .communityRepo()
      .findOne({ lowercaseName: communityName }, { populate });

    // Construct the result object to have the membership form's name, the form
    // items included in the form, as well as the membership types.
    const result = Object.create(null);

    const { membershipForm } = community;
    const { description, items, name: membershipFormName } = membershipForm;

    result.description = description;
    result.name = membershipFormName;
    result.membershipTypes = community.getPublicMembershipTypes();
    result.items = items
      .getItems()
      .map((item: FormItem) => item.serializeFormItem());

    return result;
  }
}
