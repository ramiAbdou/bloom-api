import { GraphQLResolveInfo } from 'graphql';
import listFields from 'graphql-list-fields';
import { AnyEntity, EntityName } from 'mikro-orm';

import BloomManager from '@core/db/BloomManager';

interface ResolveFindArgs {
  info: GraphQLResolveInfo;
}

export default function resolveFind<T extends AnyEntity<T>>(
  entityName: EntityName<T>,
  { info }: ResolveFindArgs
): Promise<T[]> {
  const fields: string[] = listFields(info)?.reduce(
    (acc: string[], field: string) => {
      const segmentedFields: string[] = field.split('.');

      if (segmentedFields.length === 1) return acc;

      const reconstructedFields = segmentedFields
        .slice(0, segmentedFields.length - 1)
        .join('.');

      return [...acc, reconstructedFields];
    },
    []
  );

  const populate: string[] = [...new Set(fields)];

  return new BloomManager().em.find(entityName, {}, { populate });
}
