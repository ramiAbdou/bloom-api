import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import MemberValue from '@entities/member-value/MemberValue';
import Member from '@entities/member/Member';
import Question, { QuestionCategory } from '@entities/question/Question';
import { QueryEvent } from '@util/events';
import MemberSocials from './MemberSocials';

export default class MemberSocialsSubscriber
  implements EventSubscriber<MemberSocials> {
  getSubscribedEntities(): EntityName<MemberSocials>[] {
    return [MemberSocials];
  }

  async afterUpdate({ changeSet, entity: socials }: EventArgs<MemberSocials>) {
    cache.invalidateKeys([
      `${QueryEvent.GET_MEMBER_SOCIALS}-${socials.member.id}`
    ]);

    const bm = new BloomManager();

    const member = await bm.findOne(Member, socials.member.id);

    // ## SYNC MEMBER VALUES

    const { clubhouseUrl, facebookUrl, instagramUrl, linkedInUrl, twitterUrl } =
      changeSet.payload ?? {};

    if (clubhouseUrl) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.CLUBHOUSE_URL,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: clubhouseUrl },
        { update: true }
      );
    }

    if (instagramUrl) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.INSTAGRAM_URL,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: instagramUrl },
        { update: true }
      );
    }

    if (facebookUrl) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.FACEBOOK_URL,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: facebookUrl },
        { update: true }
      );
    }

    if (linkedInUrl) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.LINKED_IN_URL,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: twitterUrl },
        { update: true }
      );
    }

    if (twitterUrl) {
      const question: Question = await bm.findOne(Question, {
        category: QuestionCategory.TWITTER_URL,
        community: member.community.id
      });

      await bm.findOneOrCreate(
        MemberValue,
        { member: member.id, question: question.id },
        { member: member.id, question: question.id, value: twitterUrl },
        { update: true }
      );
    }

    await bm.flush();
  }
}
