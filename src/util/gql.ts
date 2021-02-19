import { ArgsType, Field, ObjectType } from 'type-graphql';

@ArgsType()
export class PopulateArgs {
  @Field(() => [String], { nullable: true })
  populate?: string[];
}

@ObjectType()
export class TimeSeriesData {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  value: number;
}
