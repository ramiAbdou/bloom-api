/**
 * @fileoverview Resolver Test: Membership
 * @author Rami Abdou
 */

import { expect, should } from 'chai';

import {
  FormQuestionCategory,
  FormQuestionType,
  FormValueInput
} from '@constants';
import { Membership, User } from '@entities';
import BloomManager from '@util/db/BloomManager';
import db from '@util/db/db';
import { callGQL } from '@util/util';
import Community from '../community/Community';

describe('Membership Resolver', () => {
  const createMembership = `
    mutation Membership (
      $communityId: String!,
      $data: [FormValueInput!]!,
      $email: String
    ) {
      createMembership(
        communityId: $communityId,
        data: $data,
        email: $email
      ) { id }
    }
  `;

  const updateMembership = `
    mutation Membership ($membershipId: String!, $data: [FormValueInput!]!) {
      updateMembershipData(membershipId: $membershipId, data: $data) { 
        getBasicMembershipData { title value }
      }
    }
  `;

  const respondToMembership = `
    mutation Membership (
      $adminId: String!
      $membershipId: String!,
      $response: Int!
    ) {
      respondToMembership(
        adminId: $adminId,
        membershipId: $membershipId,
        response: $response
      ) { status }
    }
  `;

  let community: Community;

  /* 
  ___       __             
 | _ ) ___ / _|___ _ _ ___ 
 | _ \/ -_)  _/ _ \ '_/ -_)
 |___/\___|_| \___/_| \___|
  */

  before(async () => {
    await db.cleanForTesting();
    await db.createConnection();

    const bm = new BloomManager();

    community = bm.communityRepo().create({
      membershipForm: [
        {
          category: FormQuestionCategory.FIRST_NAME,
          required: true,
          title: 'First Name',
          type: FormQuestionType.SHORT_TEXT
        },
        {
          category: FormQuestionCategory.LAST_NAME,
          required: true,
          title: 'Last Name',
          type: FormQuestionType.SHORT_TEXT
        },
        {
          category: FormQuestionCategory.EMAIL,
          required: true,
          title: 'Email',
          type: FormQuestionType.SHORT_TEXT
        },
        {
          category: FormQuestionCategory.MEMBERSHIP_TYPE,
          options: ['Family Member', 'General Member', 'Admin'],
          required: true,
          title: 'What type of membership are you interested in?',
          type: FormQuestionType.MULTIPLE_CHOICE
        },
        {
          required: true,
          title: 'What do you hope to gain from ColorStack?',
          type: FormQuestionType.LONG_TEXT
        }
      ],
      membershipTypes: [
        { name: 'General Member' },
        { name: 'Family Member' },
        { isAdmin: true, name: 'Admin' }
      ],
      name: 'ColorStack'
    });

    await bm.persistAndFlush(community);
  });

  /* 
  _____       _   
 |_   _|__ __| |_ 
   | |/ -_|_-<  _|
   |_|\___/__/\__|
  */

  it(`createMembership - user doesn't exist yet.`, async () => {
    const email = 'rami@bl.community';
    const data: FormValueInput[] = [
      { category: FormQuestionCategory.FIRST_NAME, value: 'Rami' },
      { category: FormQuestionCategory.LAST_NAME, value: 'Abdou' },
      { category: FormQuestionCategory.EMAIL, value: email },
      {
        category: FormQuestionCategory.MEMBERSHIP_TYPE,
        value: 'Family Member'
      },
      {
        title: 'What do you hope to gain from ColorStack?',
        value: 'Family Member'
      }
    ];

    await callGQL({
      source: createMembership,
      variables: { communityId: community.id, data }
    });

    const bm = new BloomManager();
    const membership: Membership = await bm
      .membershipRepo()
      .findOne({ user: { email } }, ['user']);

    should().exist(membership);
    expect(membership.data).to.eql({
      'What do you hope to gain from ColorStack?': 'Family Member'
    });

    await bm.removeAndFlush([membership, membership.user]);
  });

  /* 
  _____       _   
 |_   _|__ __| |_ 
   | |/ -_|_-<  _|
   |_|\___/__/\__|
  */

  it(`createMembership - user already exists.`, async () => {
    const bm = new BloomManager();

    const email = 'rami@bl.community';
    const user: User = bm.userRepo().create({
      email,
      firstName: 'Rami',
      lastName: 'Abdou'
    });

    await bm.persistAndFlush(user);

    const data: FormValueInput[] = [
      { category: FormQuestionCategory.FIRST_NAME, value: 'Rami' },
      { category: FormQuestionCategory.LAST_NAME, value: 'Abdou' },
      { category: FormQuestionCategory.EMAIL, value: email },
      {
        category: FormQuestionCategory.MEMBERSHIP_TYPE,
        value: 'Family Member'
      },
      {
        title: 'What do you hope to gain from ColorStack?',
        value: 'Family Member'
      }
    ];

    await callGQL({
      source: createMembership,
      variables: { communityId: community.id, data, email }
    });

    const membership: Membership = await bm
      .membershipRepo()
      .findOne({ user: { email } });

    should().exist(membership);
    expect(membership.data).to.eql({
      'What do you hope to gain from ColorStack?': 'Family Member'
    });
  });

  /* 
  _____       _   
 |_   _|__ __| |_ 
   | |/ -_|_-<  _|
   |_|\___/__/\__|
  */

  it(`updateMembershipData`, async () => {
    const bm = new BloomManager();

    const data: FormValueInput[] = [
      { title: 'What do you hope to gain from ColorStack?', value: 'YOUUUUU!' }
    ];

    const membership: Membership = await bm
      .membershipRepo()
      .findOne({ user: { email: 'rami@bl.community' } });

    const response = await callGQL({
      source: updateMembership,
      variables: { data, membershipId: membership.id }
    });

    const result = response.data.updateMembershipData.getBasicMembershipData;

    expect(result).to.eql([
      {
        title: 'What type of membership are you interested in?',
        value: 'Family Member'
      },
      { title: 'What do you hope to gain from ColorStack?', value: 'YOUUUUU!' }
    ]);
  });

  /* 
  _____       _   
 |_   _|__ __| |_ 
   | |/ -_|_-<  _|
   |_|\___/__/\__|
  */

  it(`respondToMembership - accept.`, async () => {
    const bm = new BloomManager();

    const admin: User = bm.userRepo().create({
      email: 'jehron@colorstack.org',
      firstName: 'Jehron',
      lastName: 'Petty'
    });

    await bm.persistAndFlush(admin);

    const { id: membershipId }: Membership = await bm
      .membershipRepo()
      .findOne({ user: { email: 'rami@bl.community' } });

    const response = await callGQL({
      source: respondToMembership,
      variables: { adminId: admin.id, membershipId, response: 1 }
    });

    const { status } = response.data.respondToMembership;
    expect(status).to.equal(1);
  });

  /* 
  _____       _   
 |_   _|__ __| |_ 
   | |/ -_|_-<  _|
   |_|\___/__/\__|
  */

  it(`respondToMembership - reject.`, async () => {
    const bm = new BloomManager();

    const { id: adminId }: User = await bm.userRepo().findOne({
      email: 'jehron@colorstack.org'
    });

    const { id: membershipId }: Membership = await bm
      .membershipRepo()
      .findOne({ user: { email: 'rami@bl.community' } });

    const response = await callGQL({
      source: respondToMembership,
      variables: { adminId, membershipId, response: -1 }
    });

    const { status } = response.data.respondToMembership;
    expect(status).to.equal(-1);
  });

  /* 
    _    __ _           
   /_\  / _| |_ ___ _ _ 
  / _ \|  _|  _/ -_) '_|
 /_/ \_\_|  \__\___|_|  
  */

  after(async () => db.cleanForTesting());
});
