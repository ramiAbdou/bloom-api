import { take } from './util';

test(`take() returns the 2nd value of the first 2-tuple who's first element is true.`, () => {
  const result1: string = take([
    [true, 'one'],
    [true, 'two'],
    [true, 'three']
  ]);

  expect(result1).toBe('one');
});
