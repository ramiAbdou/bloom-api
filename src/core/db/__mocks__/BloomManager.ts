import { EntityName, FilterQuery } from '@mikro-orm/core';

import { BloomFindOneOptions } from '../BloomManager.types';

export default jest.fn().mockImplementation(() => {
  return {
    findOneOrFail: jest.fn(
      (
        entityName: EntityName,
        where: FilterQuery,
        options: BloomFindOneOptions
      ) => {
        return null;
      }
    )
  };
});
