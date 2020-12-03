import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class CreateEventArgs {
  @Field()
  description: string;

  @Field()
  endTime: string;

  @Field()
  startTime: string;

  @Field()
  title: string;

  @Field()
  zoomJoinUrl: string;
}
