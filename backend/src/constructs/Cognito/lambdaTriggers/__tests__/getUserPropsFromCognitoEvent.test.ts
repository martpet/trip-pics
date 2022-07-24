import { getUserPropsFromCognitoEvent } from '../getUserPropsFromCognitoEvent';
import event from './__fixtures__/postConfirmationEvent';

describe('getUserPropsFromCognitoEvent', () => {
  test('Return user props', () => {
    expect(getUserPropsFromCognitoEvent(event)).toMatchSnapshot();
  });
});
