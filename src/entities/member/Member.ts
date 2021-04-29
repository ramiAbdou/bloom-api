import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  BeforeUpdate,
  Cascade,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  Unique
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { now } from '@util/util';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventGuest from '../event-guest/EventGuest';
import EventWatch from '../event-watch/EventWatch';
import MemberRefresh from '../member-refresh/MemberRefresh';
import MemberSocials from '../member-socials/MemberSocials';
import MemberType from '../member-type/MemberType';
import MemberValue from '../member-value/MemberValue';
import User from '../user/User';

export enum MemberRole {
  ADMIN = 'Admin',
  OWNER = 'Owner'
}

export enum MemberStatus {
  ACCEPTED = 'Accepted',
  INVITED = 'Invited',
  PENDING = 'Pending',
  REJECTED = 'Rejected'
}

@ObjectType()
@Entity()
@Unique({ properties: ['community', 'email'] })
export default class Member extends BaseEntity {
  // ## FIELDS

  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  bio: string;

  @Field()
  @Property()
  email: string;

  @Field()
  @Property()
  firstName: string;

  @Field()
  @Property({ persist: false })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Field()
  @Property()
  lastName: string;

  // Refers to the date that the member was ACCEPTED.
  @Field({ nullable: true })
  @Property({ nullable: true })
  joinedAt?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  pictureUrl: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  position?: string;

  // If the member has a role, it will either be ADMIN or OWNER. There should
  // only be one OWNER in a community.
  @Field(() => String, { nullable: true })
  @Enum({ items: () => MemberRole, nullable: true, type: String })
  role: MemberRole;

  @Field(() => String)
  @Enum({ items: () => MemberStatus, type: String })
  status: MemberStatus = MemberStatus.PENDING;

  // ## LIFECYCLE HOOKS

  @BeforeCreate()
  beforeCreate(): void {
    if (this.role && this.status !== MemberStatus.INVITED) {
      this.joinedAt = now();
      this.status = MemberStatus.ACCEPTED;
    }

    if (this.status === MemberStatus.ACCEPTED && !this.joinedAt) {
      this.joinedAt = now();
    }

    // If no member type is provided, assign them the default member.
    // Every community should've assigned one default member.
    if (!this.memberType) this.memberType = this.community.defaultType;

    this.email = this.email.toLowerCase();
    this.firstName = this.firstName.trim();
    this.lastName = this.lastName.trim();
  }

  @BeforeUpdate()
  beforeUpdate(): void {
    if (this.status === MemberStatus.ACCEPTED && !this.joinedAt) {
      this.joinedAt = now();
    }
  }

  // ## RELATIONSHIPS

  @Field(() => [EventAttendee])
  @OneToMany(() => EventAttendee, ({ member }) => member)
  attendees = new Collection<EventAttendee>(this);

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => [EventGuest])
  @OneToMany(() => EventGuest, ({ member }) => member)
  guests = new Collection<EventGuest>(this);

  // 99% of the time, type MUST exist. However, in some communities, the OWNER
  // or ADMINs are not actually general members of the community. For example,
  // in ColorStack, the Community Manager isn't a part of the community, but
  // in MALIK, even the National President is a general dues-paying member.
  @Field(() => MemberType)
  @ManyToOne(() => MemberType, { nullable: true })
  memberType: MemberType;

  @OneToMany(() => MemberRefresh, ({ member }) => member)
  refreshes: Collection<MemberRefresh> = new Collection<MemberRefresh>(this);

  @Field(() => MemberSocials)
  @OneToOne(() => MemberSocials, ({ member }) => member)
  socials: MemberSocials;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;

  // Data will only be populated if a question has ever been answered before.
  @Field(() => [MemberValue])
  @OneToMany(() => MemberValue, ({ member }) => member, {
    cascade: [Cascade.ALL]
  })
  values = new Collection<MemberValue>(this);

  @Field(() => [EventWatch])
  @OneToMany(() => EventWatch, ({ member }) => member)
  watches = new Collection<EventWatch>(this);
}
