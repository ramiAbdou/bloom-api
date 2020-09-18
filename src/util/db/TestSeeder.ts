/**
 * @fileoverview Utility: TestSeeder
 * - Helper functions to quickly seed a DB, especially used for testing.
 * @author Rami Abdou
 */

import { company, internet, name as rname, random as r } from 'faker';
import { EntityManager } from 'mikro-orm';

import { Community, Membership, MembershipType, User } from '@entities';

export default class TestSeeder {
  em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  community = (name?: string): Community => {
    const community = new Community();
    community.name = name || company.companyName();
    this.em.persist(community);
    return community;
  };

  membership = (
    type?: MembershipType,
    community?: Community,
    user?: User
  ): Membership => {
    const membership = new Membership();
    membership.type = type || this.membershipType();
    membership.community = community || this.community();
    membership.user = user || this.user();
    this.em.persist(membership);
    return membership;
  };

  membershipType = (name?: string, community?: Community): MembershipType => {
    const type = new MembershipType();
    type.name = name || r.word();
    type.community = community || this.community();
    this.em.persist(type);
    return type;
  };

  user = (): User => {
    const user = new User();
    user.firstName = rname.firstName();
    user.lastName = rname.lastName();
    user.email = internet.email(null, null, 'cornell.edu');
    user.gender = r.arrayElement(['Male', 'Female', 'Non-Binary']);
    this.em.persist(user);
    return user;
  };
}
