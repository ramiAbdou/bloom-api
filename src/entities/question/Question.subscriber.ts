import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import Question from './Question';

@Subscriber()
export default class QuestionSubscriber implements EventSubscriber<Question> {
  async afterUpdate({ entity }: EventArgs<Question>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_QUESTIONS}-${entity.community.id}`
    ]);
  }
}
