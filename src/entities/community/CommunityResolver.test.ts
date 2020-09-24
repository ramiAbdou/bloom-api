/**
 * @fileoverview Resolver Test: Community
 * @author Rami Abdou
 */

import { expect, should } from 'chai';

import bloomManager from '@bloomManager';
import {
  FormQuestion,
  FormQuestionCategory,
  FormQuestionType
} from '@constants';
import { cleanDBForTesting, createConnection } from '@util/db/util';
import { callGQL } from '@util/util';

describe('Community Resolver', () => {
  before(async () => {
    await cleanDBForTesting();
    await createConnection();
  });

  it('Create a community.', async () => {
    const source = `
      mutation Community (
        $name: String!,
        $membershipForm: [FormQuestionInput!]!,
        $membershipTypes: [MembershipType!]!
      ) {
        createCommunity(
          name: $name,
          membershipForm: $membershipForm,
          membershipTypes: $membershipTypes
        ) { id }
      }
     `;

    const name = 'ColorStack';
    const membershipForm: FormQuestion[] = [
      {
        category: FormQuestionCategory.FIRST_NAME,
        required: true,
        title: 'First Name',
        type: FormQuestionType.SHORT_TEXT
      }
    ];

    const membershipTypes = [
      { name: 'General Member' },
      { name: 'Family Member' },
      { isAdmin: true, name: 'Admin' }
    ];

    await callGQL({
      source,
      variables: { membershipForm, membershipTypes, name }
    });

    const bm = bloomManager.fork();
    const community = await bm
      .communityRepo()
      .findOne({ name }, ['membershipTypes']);

    should().exist(community);
    expect(community.name).to.equal(name);
    expect(community.membershipForm).to.eql(membershipForm);
    expect(community.membershipTypes.length).to.equal(membershipTypes.length);
  });

  after(async () => cleanDBForTesting());
});
