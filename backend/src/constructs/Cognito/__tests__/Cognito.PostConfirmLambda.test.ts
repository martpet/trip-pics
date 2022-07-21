import { PostConfirmationTriggerEvent } from 'aws-lambda';

import { handler as postConfirmLambdaHandler } from '../Cognito.PostConfirmLambda';
import { createDbUser } from '../createDbUser';
import { getUserPropsFromCognitoEvent } from '../getUserPropsFromCognitoEvent';

jest.mock('../getUserPropsFromCognitoEvent');
jest.mock('../createDbUser');

const event = Object.freeze({}) as PostConfirmationTriggerEvent;

describe('postConfirmLambdaHandler', () => {
  test('Call createDbUser with props from getUserPropsFromCognitoEvent', async () => {
    const userProps = Object.freeze({});
    (getUserPropsFromCognitoEvent as jest.Mock).mockReturnValue(userProps);
    postConfirmLambdaHandler(event);
    expect(getUserPropsFromCognitoEvent).toBeCalledWith(event);
    expect(createDbUser).toBeCalledWith(userProps);
  });

  test('Return call arg', async () => {
    await expect(postConfirmLambdaHandler(event)).resolves.toBe(event);
  });
});
