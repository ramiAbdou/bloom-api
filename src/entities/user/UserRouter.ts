/**
 * @fileoverview Router: User
 * @author Rami Abdou
 */

import { Request, Response } from 'express';

import { Route } from '@constants';
import BloomManager from '@util/db/BloomManager';
import Router from '@util/Router';

class UserRouter extends Router {
  get routes(): Route[] {
    return [
      {
        callback: this.validateEmail,
        method: 'GET',
        route: '/:userId/validate'
      }
    ];
  }

  private async validateEmail(request: Request, response: Response) {
    const { userId } = request.params;

    const bm = new BloomManager();

    try {
      const body = this.service.process(
        request.body.form_response.answers,
        request.params.tag
      );

      await runUserSignup(body);
      response.sendStatus(200); // Send OK back to Typeform Webhook API.
    } catch {
      response.sendStatus(500); // Send error back to Typeform Webhook API.
    }
  }
}

export default new UserRouter().router;
