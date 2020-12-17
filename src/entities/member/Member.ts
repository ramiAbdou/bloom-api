import { Authorized, Field, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { now } from '@util/util';
import Community from '../community/Community';
import MemberData from '../member-data/MemberData';
import MemberPayment from '../member-payment/MemberPayment';
import MemberRefresh from '../member-refresh/MemberRefresh';
import MemberType from '../member-type/MemberType';
import Question from '../question/Question';
import User from '../user/User';
import { MemberRole, MemberStatus, QuestionValue } from './Member.types';

@ObjectType()
@Entity()
export default class Member extends BaseEntity {
  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  bio: string;

  // Member is allowed to opt-out of email notifications that send after an
  // event gets posted.
  @Field(() => Boolean)
  @Property({ type: Boolean })
  emailNotifications = true;

  // Refers to the date that the member was ACCEPTED.
  @Field({ nullable: true })
  @Property({ nullable: true })
  joinedOn: string;

  // If the member has a role, it will either be ADMIN or OWNER. There should
  // only be one OWNER in a community.
  @Field(() => String, { nullable: true })
  @Enum({ items: () => MemberRole, nullable: true, type: String })
  role: MemberRole;

  @Field(() => String)
  @Enum({ items: ['REJECTED', 'PENDING', 'INVITED', 'ACCEPTED'], type: String })
  status: MemberStatus = 'PENDING';

  // ## MEMBER FUNCTIONS

  /**
   * Returns all of the data associated with this Member formatted in
   * with questionId and value. Only fetches the questions in where
   * inExpandedDirectoryCard are true however.
   *
   * Used in the GET_DIRECTORY call.
   */
  @Authorized()
  @Field(() => [QuestionValue])
  cardData(): QuestionValue[] {
    const data = this.data?.getItems();
    const { email, gender, firstName, lastName } = this.user;

    return this.community.questions
      .getItems()
      .filter(({ inExpandedDirectoryCard }) => inExpandedDirectoryCard)
      .map(({ category, id, title }: Question) => {
        let value: string;
        const result = data.find(({ question }) => question.title === title);

        if (result) value = result.value;
        else if (category === 'EMAIL') value = email;
        else if (category === 'FIRST_NAME') value = firstName;
        else if (category === 'GENDER') value = gender;
        else if (category === 'JOINED_ON') value = this.joinedOn;
        else if (category === 'LAST_NAME') value = lastName;
        else if (category === 'MEMBERSHIP_TYPE') value = this.type.name;

        return { questionId: id, value };
      });
  }

  /**
   * Returns all of the data associated with this Member formatted in
   * with questionId and value.
   *
   * Used in the GET_DATABASE call.
   */
  @Authorized('ADMIN')
  @Field(() => [QuestionValue])
  allData(): QuestionValue[] {
    const data = this.data?.getItems();
    const { email, gender, firstName, lastName } = this.user;

    return this.community.questions
      .getItems()
      .map(({ category, id, title }: Question) => {
        let value: string;
        const result = data.find(({ question }) => question.title === title);

        if (result) value = result.value;
        else if (category === 'EMAIL') value = email;
        else if (category === 'FIRST_NAME') value = firstName;
        else if (category === 'GENDER') value = gender;
        else if (category === 'JOINED_ON') value = this.joinedOn;
        else if (category === 'LAST_NAME') value = lastName;
        else if (category === 'MEMBERSHIP_TYPE') value = this.type.name;

        return { questionId: id, value };
      });
  }

  /**
   * Returns the pending application data that will allow the ADMIN of the
   * community to accept or reject the application.
   *
   * Used in the GET_APPLICANTS call.
   */
  @Authorized('ADMIN')
  @Field(() => [QuestionValue])
  applicantData(): QuestionValue[] {
    // This method is only intended for retrieving pending application data.
    if (this.status !== 'PENDING') return null;

    const data = this.data.getItems();
    const { email, gender, firstName, lastName } = this.user;

    return (
      this.community.questions
        .getItems()
        // We only need the questions in the application.
        .filter(({ inApplication }: Question) => inApplication)
        .map(({ category, id, title }: Question) => {
          let value: string;
          const result = data.find(({ question }) => question.title === title);

          if (result) value = result.value;
          else if (category === 'JOINED_ON') value = this.joinedOn;
          else if (category === 'EMAIL') value = email;
          else if (category === 'FIRST_NAME') value = firstName;
          else if (category === 'GENDER') value = gender;
          else if (category === 'LAST_NAME') value = lastName;
          else if (category === 'MEMBERSHIP_TYPE') value = this.type.name;

          return { questionId: id, value };
        })
    );
  }

  @BeforeCreate()
  beforeCreate() {
    if (this.role || this.community.autoAccept) {
      this.joinedOn = now();
      this.status = 'ACCEPTED';
    }

    // If no member type is provided, assign them the default member.
    // Every community should've assigned one default member.
    if (!this.type) {
      // eslint-disable-next-line prefer-destructuring
      this.type = this.community.types
        .getItems()
        .find(({ isDefault }) => isDefault);
    }
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  // Data will only be populated if a question has ever been answered before.
  @Field(() => [MemberData])
  @OneToMany(() => MemberData, ({ member }) => member)
  data = new Collection<MemberData>(this);

  @OneToMany(() => MemberPayment, ({ member }) => member)
  payments: Collection<MemberPayment> = new Collection<MemberPayment>(this);

  @OneToMany(() => MemberRefresh, ({ member }) => member)
  refreshes: Collection<MemberRefresh> = new Collection<MemberRefresh>(this);

  // 99% of the time, type MUST exist. However, in some communities, the OWNER
  // or ADMINs are not actually general members of the community. For example,
  // in ColorStack, the Community Manager isn't a part of the community, but
  // in MALIK, even the National President is a general dues-paying member.
  @Field(() => MemberType)
  @ManyToOne(() => MemberType, { nullable: true })
  type: MemberType;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;
}
