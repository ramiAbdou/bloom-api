/**
 * @group unit
 */

import bodyParser from 'body-parser';
import express from 'express';

import parseBody from './parseBody';

describe('parseBody()', () => {
  test('Is Stripe webhook URL.', () => {
    const req = { originalUrl: '/stripe/webhook' } as express.Request;
    const res = {} as express.Response;
    const next = jest.fn() as express.NextFunction;

    jest.spyOn(bodyParser, 'json');
    parseBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(bodyParser.json).not.toHaveBeenCalled();
  });

  test('Is not a webhook URL.', () => {
    const req = { originalUrl: '/graphql' } as express.Request;
    const res = {} as express.Response;
    const next = jest.fn() as express.NextFunction;

    const mockedBodyParserJson = jest.spyOn(bodyParser, 'json');
    mockedBodyParserJson.mockReturnValue(() => {});

    parseBody(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockedBodyParserJson).toHaveBeenCalled();
  });
});
