import { EventSubscriber, Subscriber } from '@mikro-orm/core';

import Question from './Question';

@Subscriber()
export default class QuestionSubscriber implements EventSubscriber<Question> {}
