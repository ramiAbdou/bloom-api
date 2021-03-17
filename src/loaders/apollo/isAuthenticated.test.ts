import cases from 'jest-in-case';

import BloomManager from '@core/db/BloomManager';
import { TestObject } from '@util/constants';
import isAuthenticated, { IsAuthenticatedArgs } from './isAuthenticated';

cases(
  `isAuthenticated() - Is authenticated.`,
  async ({ input }: TestObject<IsAuthenticatedArgs>) => {
    const mockedFindOne = jest
      .spyOn(BloomManager.prototype, 'findOne')
      .mockImplementation(async () => {
        if (input.context.memberId === '1') return { role: null };
        if (input.context.memberId === '2') return { role: 'Admin' };
        if (input.context.memberId === '3') return { role: 'Owner' };
        return null;
      });

    const actualOutput: boolean = await isAuthenticated(input);

    expect(actualOutput).toBe(true);
    expect(mockedFindOne).toBeCalledTimes(1);
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
    const mockedFindOne = jest
      .spyOn(BloomManager.prototype, 'findOne')
      .mockImplementation(async () => {
        if (input.context.memberId === '1') return { role: null };
        if (input.context.memberId === '2') return { role: 'Admin' };
        if (input.context.memberId === '3') return { role: 'Owner' };
        return null;
      });

    const actualOutput: boolean = await isAuthenticated(input);

    expect(actualOutput).toBe(false);
    if (input.context.memberId) expect(mockedFindOne).toBeCalledTimes(1);
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
