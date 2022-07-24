import { Callback, Context } from 'aws-lambda';

import { handler } from '../postAuthentication/postAuthentication';
import { updateUserFromEvent } from '../postAuthentication/updateUserFromEvent';
import event from './__fixtures__/postAuthenticationEvent';

jest.mock('../postAuthentication/updateUserFromEvent');

const context = {} as Context;
const callback = {} as Callback;

describe('Cognito post authentication lambda', () => {
  test('Call "updateUserFromEvent" with event', async () => {
    await handler(event, context, callback);
    expect(updateUserFromEvent).toHaveBeenCalledWith(event);
  });

  test('Resolve with event', async () => {
    return expect(handler(event, context, callback)).resolves.toBe(event);
  });
});
