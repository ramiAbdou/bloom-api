import { ArgsType, Field } from 'type-graphql';
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
