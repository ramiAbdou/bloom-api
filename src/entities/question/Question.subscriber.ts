import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/db/cache';
import Question from './Question';

export default class QuestionSubscriber implements EventSubscriber<Question> {
  getSubscribedEntities(): EntityName<Question>[] {
    return [Question];
  }

  async afterUpdate({ entity }: EventArgs<Question>) {
    cache.invalidateEntries([
      `${QueryEvent.GET_QUESTIONS}-${entity.community.id}`
    ]);
  }
}
