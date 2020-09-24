/**
 * @fileoverview Population Enum: Community
 * @author Rami Abdou
 */

import { registerEnumType } from 'type-graphql';

enum CommunityPopulation {
  GET_MEMBERSHIPS = 'GET_MEMBERSHIPS'
}

registerEnumType(CommunityPopulation, { name: 'CommunityPopulation' });
export default CommunityPopulation;
