import { ArgsType, Field } from 'type-graphql';

export enum MemberRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export enum MemberStatus {
  ACCEPTED = 'ACCEPTED',
  INVITED = 'INVITED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

// ## GQL TYPES

@ArgsType()
export class AdminArgs {
  @Field(() => [String])
  memberIds: string[];
}

@ArgsType()
export class MemberIdArgs {
  @Field(() => String)
  memberId: string;
}
