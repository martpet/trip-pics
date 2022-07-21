import { PostConfirmationTriggerEvent } from 'aws-lambda';

import { createDbUser } from './createDbUser';
import { getUserPropsFromCognitoEvent } from './getUserPropsFromCognitoEvent';

export const handler = async (event: PostConfirmationTriggerEvent) => {
  const userProps = getUserPropsFromCognitoEvent(event);
  await createDbUser(userProps);
  return event;
};
