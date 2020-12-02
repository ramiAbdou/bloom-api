/**
 * @fileoverview Repository: MembershipQuestion
 * @author Rami Abdou
 */

import { Event } from '@constants';
import cache from '@util/cache';
import BaseRepo from '@util/db/BaseRepo';
import MembershipQuestion from './MembershipQuestion';

export default class MembershipQuestionRepo extends BaseRepo<
  MembershipQuestion
> {
  renameQuestion = async (id: string, title: string, communityId: string) => {
    const question = await this.findOne({ id });
    console.log(title);
    question.title = title;

    try {
      await this.flush('QUESTION_RENAMED', question);
      // console.log(question);
      cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);
      return question;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
}
