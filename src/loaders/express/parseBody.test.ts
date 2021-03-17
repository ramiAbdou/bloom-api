import bodyParser from 'body-parser';
import express from 'express';
import cases from 'jest-in-case';

import { TestObject } from '@util/constants';
import parseBody from './parseBody';

cases(
  'parseBody() - Is webhook URL.',
  ({ input }: TestObject) => {
    const req = { originalUrl: input } as express.Request;
    const res = {} as express.Response;
    const next = jest.fn() as express.NextFunction;

    jest.spyOn(bodyParser, 'json');
    parseBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(bodyParser.json).not.toHaveBeenCalled();
  },
  { 'Is Stripe webhook URL.': { input: '/stripe/webhook' } }
);

cases(
  'parseBody() - Is not a webhook URL.',
  ({ input }: TestObject) => {
    const req = { originalUrl: input } as express.Request;
    const res = {} as express.Response;
    const next = jest.fn() as express.NextFunction;

    const mockedBodyParserJson = jest.spyOn(bodyParser, 'json');
    mockedBodyParserJson.mockImplementation(() => () => {});

    parseBody(req, res, next);

    expect(mockedBodyParserJson).toHaveBeenCalled();
    mockedBodyParserJson.mockReset();
  },
  { 'Is GraphQL endpoint.': { input: '/graphql' } }
);
