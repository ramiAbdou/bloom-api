import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import MemberValue from '@entities/member-value/MemberValue';
import Question, { QuestionCategory } from '@entities/question/Question';
import { QueryEvent } from '@util/events';
import Member, { MemberStatus } from './Member';

export default class MemberSubscriber implements EventSubscriber<Member> {
  getSubscribedEntities(): EntityName<Member>[] {
    return [Member];
  }

  async afterUpdate({ changeSet, entity: member }: EventArgs<Member>) {
    cache.invalidateKeys([`${QueryEvent.GET_MEMBER}-${member.id}`]);

    const { originalEntity } = changeSet;

    if (
      originalEntity?.status === MemberStatus.PENDING &&
      member?.status !== MemberStatus.PENDING
    ) {
      cache.invalidateKeys([
        `${QueryEvent.GET_APPLICANTS}-${member.community.id}`
      ]);
    }

    // ## SYNC MEMBER VALUES

    const { bio, firstName, joinedAt, lastName, plan } =
      changeSet.payload ?? {};

    const bm = new BloomManager();

    if (bio) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.BIO,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: bio },
        { update: true }
      );
    }

    if (firstName) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.FIRST_NAME,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: firstName },
        { update: true }
      );
    }

    if (lastName) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.LAST_NAME,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: lastName },
        { update: true }
      );
    }

    if (joinedAt) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.JOINED_AT,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: joinedAt },
        { update: true }
      );
    }

    if (plan) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.MEMBER_PLAN,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: plan.name },
        { update: true }
      );
    }

    await bm.flush();
  }
}
