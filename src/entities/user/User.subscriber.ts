import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { QuestionCategory } from '@entities/question/Question.types';
import Member from '../member/Member';
import Question from '../question/Question';
import User from './User';

export default class UserSubscriber implements EventSubscriber<User> {
  async afterCreate(args): Promise<void> {
    if (args.changeSet.name !== 'User') return;

    // const bm = new BloomManager();

    // let members: Member[];
    // const userId: string = args.entity.id;

    // if (args.changeSet.payload.gender) {
    //   console.log('HERE', userId);

    //   members = await bm.find(
    //     Member,
    //     { user: { id: userId } },
    //     { populate: ['community'] }
    //   );

    //   const genderQuestion: Question = await bm.findOne(Question, {
    //     category: QuestionCategory.GENDER,
    //     community: { id: members.map((member: Member) => member.community?.id) }
    //   });
    // }

    // console.log(args.changeSet.payload);
  }
}
