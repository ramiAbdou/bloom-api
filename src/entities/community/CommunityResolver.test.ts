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
import { CommunityPopulation } from './CommunityArgs';

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

  it('Get a community (no memberships).', async () => {
    const bm = bloomManager.fork();
    const community = bm.communityRepo().create({
      membershipForm: [
        {
          category: FormQuestionCategory.FIRST_NAME,
          required: true,
          title: 'First Name',
          type: FormQuestionType.SHORT_TEXT
        }
      ],
      name: 'BolorStack'
    });

    await bm.persistAndFlush(community);

    const source = `
      query Community ($id: String) {
        getCommunity(id: $id) { name }
      }
    `;

    const response = await callGQL({
      source,
      variables: { id: community.id }
    });

    expect(response.data.getCommunity.name).to.equal(community.name);
  });

  it('Get a community (with memberships).', async () => {
    const bm = bloomManager.fork();
    const community = bm.communityRepo().create({
      membershipForm: [
        {
          category: FormQuestionCategory.FIRST_NAME,
          required: true,
          title: 'First Name',
          type: FormQuestionType.SHORT_TEXT
        }
      ],
      membershipTypes: [
        { name: 'General Member' },
        { name: 'Family Member' },
        { isAdmin: true, name: 'Admin' }
      ],
      name: 'DolorStack'
    });

    const user = bm.userRepo().create({
      email: 'rami@bl.community',
      firstName: 'Rami',
      lastName: 'Abdou'
    });

    bm.membershipRepo().create({
      community,
      data: {},
      type: community.membershipTypes[0],
      user
    });

    await bm.persistAndFlush(community);

    const source = `
      query Community ($id: String, $population: CommunityPopulation) {
        getCommunity(id: $id, population: $population) {
          name memberships { user { firstName } }
        }
      }
    `;

    const response = await callGQL({
      source,
      variables: {
        id: community.id,
        population: CommunityPopulation.GET_MEMBERSHIPS
      }
    });

    const result = response.data.getCommunity;

    expect(result.name).to.equal(community.name);
    expect(result.memberships[0].user.firstName).to.eql(user.firstName);
  });

  after(async () => cleanDBForTesting());
});
