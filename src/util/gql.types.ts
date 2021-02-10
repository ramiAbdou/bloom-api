import { ArgsType, Field, ObjectType } from 'type-graphql';
/**
 * @fileoverview GraphQL Types
 * - Contains all of the types needed for a GraphQL response object. File is
 * shared with React client to ensure that we have all of the typed data that
 * we need when using a GraphQL request.
 */

@ArgsType()
export class PopulateArgs {
  @Field(() => [String], { nullable: true })
  populate?: string[];
}

@ArgsType()
export class UrlNameArgs {
  @Field({ nullable: true })
  urlName?: string;
}

@ObjectType()
export class TimeSeriesData {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  value: number;
}
