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

@ArgsType()
export class AdminArgs {
  @Field(() => [String])
  memberIds: string[];
}
