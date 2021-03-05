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
    cache.invalidateKeys([`${QueryEvent.GET_MEMBER_SOCIALS}-${socials.id}`]);

    const bm = new BloomManager();

    const member = await bm.findOne(Member, { socials });

    // ## SYNC MEMBER VALUES

    const { linkedInUrl, twitterUrl } = changeSet.payload ?? {};

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
