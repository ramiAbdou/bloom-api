/**
 * @group unit
 */

import cases from 'jest-in-case';

import { TestObject } from '@util/constants';
import isAuthenticated, { IsAuthenticatedArgs } from './isAuthenticated';

cases(
  `isAuthenticated() - Is authenticated.`,
  async ({ input }: TestObject<IsAuthenticatedArgs>) => {
    const actualOutput: boolean = await isAuthenticated(input);
    expect(actualOutput).toBe(true);
  },
  {
    'No required role.': {
      input: { context: { memberId: '1' }, roles: [] }
    },

    'Required role is Admin and Member is Admin.': {
      input: { context: { memberId: '2' }, roles: ['Admin'] }
    },

    'Required role is Admin and Member is Owner.': {
      input: { context: { memberId: '3' }, roles: ['Admin'] }
    },

    'Required role is Owner and Member is Owner.': {
      input: { context: { memberId: '3' }, roles: ['Owner'] }
    }
  }
);

cases(
  `isAuthenticated() - Is not authenticated.`,
  async ({ input }: TestObject<IsAuthenticatedArgs>) => {
    const actualOutput: boolean = await isAuthenticated(input);
    expect(actualOutput).toBe(false);
  },
  {
    'No memberId is present on the context.': {
      input: { context: { memberId: null }, roles: [] }
    },

    'Required role is Admin and Member has no role.': {
      input: { context: { memberId: '1' }, roles: ['Admin'] }
    },

    'Required role is Owner and Member has no role.': {
      input: { context: { memberId: '1' }, roles: ['Owner'] }
    },

    'Required role is Owner and Member is an Admin.': {
      input: { context: { memberId: '2' }, roles: ['Owner'] }
    }
  }
);
