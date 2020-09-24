/**
 * @fileoverview Resolver Test: Membership
 * @author Rami Abdou
 */

// import { expect, should } from 'chai';

// import bloomManager from '@bloomManager';
// import {
//   FormQuestion,
//   FormQuestionCategory,
//   FormQuestionType
// } from '@constants';
import { cleanDBForTesting, createConnection } from '@util/db/util';
// import { callGQL } from '@util/util';

describe('Membership Resolver', () => {
  before(async () => {
    await cleanDBForTesting();
    await createConnection();
  });

  after(async () => cleanDBForTesting());
});
