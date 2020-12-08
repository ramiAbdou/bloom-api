import { Event } from '@constants';
import cache from '@core/cache';
import BaseRepo from '@core/db/BaseRepo';
import Question from './Question';

export default class QuestionRepo extends BaseRepo<Question> {
  renameQuestion = async (
    id: string,
    title: string,
    version: number,
    communityId: string
  ) => {
    const question = await this.findOne({ id }, ['community']);
    const { encodedUrlName } = question.community;

    if (version < question.version) {
      throw new Error(
        `Looks like somebody else just updated this question title. Please refresh and try again.`
      );
    }

    question.title = title;
    await this.flush('QUESTION_RENAMED', question, true);

    // Invalidate GET_APPLICATION since we fetch the member questions
    // there as well.
    cache.invalidateEntries(
      [
        `${Event.GET_APPLICATION}-${encodedUrlName}`,
        `${Event.GET_DIRECTORY}-${communityId}`,
        `${Event.GET_MEMBERS}-${communityId}`
      ],
      true
    );

    return question;
  };
}
