import { PostAuthenticationTriggerEvent } from 'aws-lambda';

import { getUserPropsFromEvent } from './getUserPropsFromEvent';
import { updateDbUser } from './updateDbUser';

export const handler = async (event: PostAuthenticationTriggerEvent) => {
  const userProps = getUserPropsFromEvent(event);
  await updateDbUser(userProps);
  return event;
};
