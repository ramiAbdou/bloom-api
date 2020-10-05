/**
 * @fileoverview Entity: MembershipCard
 * - This
 * @author Rami Abdou
 */

import { Entity, Enum, ManyToOne, Property } from 'mikro-orm';
import { Field, Int, ObjectType } from 'type-graphql';

import { Community, MembershipQuestion } from '@entities';
import BaseEntity from '@util/db/BaseEntity';

export type MembershipStatus = 'REJECTED' | 'PENDING' | 'APPROVED';

type CardItemCategory =
  | 'BIO'
  | 'CURRENT_LOCATION'
  | 'FACEBOOK_URL'
  | 'INSTAGRAM_URL'
  | 'LINKEDIN_URL'
  | 'TWITTER_URL';

@ObjectType()
@Entity()
export default class MembershipCardItem extends BaseEntity {
  @Field(() => String, { nullable: true })
  @Enum({
    items: [
      'CURRENT_LOCATION',
      'FACEBOOK_URL',
      'INSTAGRAM_URL',
      'LINKEDIN_URL',
      'TWITTER_URL'
    ],
    nullable: true,
    type: String
  })
  category: CardItemCategory;

  @Field(() => Boolean)
  @Property({ type: Boolean })
  inMinimizedCard = false;

  @Field(() => Int)
  @Property({ type: Number })
  order: number;

  @ManyToOne(() => Community)
  community: Community;

  @Field(() => MembershipQuestion, { nullable: true })
  @ManyToOne(() => MembershipQuestion, { nullable: true })
  question: MembershipQuestion;
}
