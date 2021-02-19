import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
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
