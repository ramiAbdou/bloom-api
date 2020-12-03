/* eslint-disable class-methods-use-this */

import { plural, singular } from 'pluralize';
import { AbstractNamingStrategy } from '@mikro-orm/core';

/**
 * Naming strategy for MikroORM to implement with PostgreSQL tables and
 * columns. This overrides the default naming mechanism.
 */
export default class NamingStrategy extends AbstractNamingStrategy {
  /**
   * Returns the pluralized version
   *
   * @param entityName
   * @returns The name of the table based on the classname.
   */
  classToTableName(entityName: string): string {
    return this.underscore(plural(entityName));
  }

  joinColumnName(propertyName: string): string {
    const property = this.underscore(singular(propertyName));
    return `${property}_${this.referenceColumnName()}`;
  }

  joinKeyColumnName(entityName: string, referencedColumnName?: string): string {
    const property = this.underscore(singular(entityName));
    return `${property}_${referencedColumnName || this.referenceColumnName()}`;
  }

  joinTableName(
    sourceEntity: string,
    targetEntity: string,
    _?: string
  ): string {
    const property = this.underscore(singular(sourceEntity));
    return `${property}_${this.underscore(plural(targetEntity))}`;
  }

  propertyToColumnName(propertyName: string): string {
    return this.underscore(propertyName);
  }

  referenceColumnName(): string {
    return 'id';
  }

  /**
   * Converts to snake casing.
   *
   * @param name String to transform.
   * @returns {string} The underscored and lowercase version of the name.
   */
  private underscore(name: string): string {
    return name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }
}
