import { PostConfirmationTriggerEvent } from 'aws-lambda';

import { handler as postConfirmLambdaHandler } from '../Cognito.PostConfirmLambda';
import { createDbUser } from '../createDbUser';
import { getUserPropsFromEvent } from '../getUserPropsFromEvent';

jest.mock('../getUserPropsFromEvent');
jest.mock('../createDbUser');

const event = Object.freeze({}) as PostConfirmationTriggerEvent;

describe('postConfirmLambdaHandler', () => {
  test('Call createDbUser with props from getUserPropsFromEvent', async () => {
    const userProps = Object.freeze({});
    (getUserPropsFromEvent as jest.Mock).mockReturnValue(userProps);
    postConfirmLambdaHandler(event);
    expect(getUserPropsFromEvent).toBeCalledWith(event);
    expect(createDbUser).toBeCalledWith(userProps);
  });

  test('Return call arg', async () => {
    await expect(postConfirmLambdaHandler(event)).resolves.toBe(event);
  });
});
