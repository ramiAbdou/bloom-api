import { ArgsType, Field, ObjectType } from 'type-graphql';

@ArgsType()
export class TokenArgs {
  @Field()
  token: string;
}

@ObjectType()
export class TimeSeriesData {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  value: number;
}
