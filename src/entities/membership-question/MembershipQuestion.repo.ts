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
  renameQuestion = async (
    id: string,
    title: string,
    version: number,
    communityId: string
  ) => {
    const question = await this.findOne({ id });

    console.log(question.title);
    console.log(title);

    if (version < question.version)
      throw new Error(
        `Looks like somebody else just updated this question title. Please refresh and try again.`
      );

    question.title = title;
    await this.flush('QUESTION_RENAMED', question);

    cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);
    return question;
  };
}
