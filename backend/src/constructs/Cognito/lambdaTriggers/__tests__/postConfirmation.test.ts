import { Callback, Context } from 'aws-lambda';

import { createUserFromEvent } from '../postConfirmation/createUserFromEvent';
import { handler } from '../postConfirmation/postConfirmation';
import event from './__fixtures__/postConfirmationEvent';

jest.mock('../postConfirmation/createUserFromEvent');

const context = {} as Context;
const callback = {} as Callback;

describe('Cognito post confirmation lambda', () => {
  test('Call "createUserFromEvent" with event', async () => {
    await handler(event, context, callback);
    expect(createUserFromEvent).toHaveBeenCalledWith(event);
  });

  test('Resolve with event', async () => {
    return expect(handler(event, context, callback)).resolves.toBe(event);
  });
});
