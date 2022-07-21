import { PostAuthenticationTriggerEvent } from 'aws-lambda';

import { getUserPropsFromCognitoEvent } from './getUserPropsFromCognitoEvent';
import { updateDbUser } from './updateDbUser';

export const handler = async (event: PostAuthenticationTriggerEvent) => {
  const userProps = getUserPropsFromCognitoEvent(event);
  await updateDbUser(userProps);
  return event;
};
