import { PostConfirmationTriggerEvent } from 'aws-lambda';

import { createDbUser } from './createDbUser';
import { getUserPropsFromEvent } from './getUserPropsFromEvent';

export const handler = async (event: PostConfirmationTriggerEvent) => {
  const userProps = getUserPropsFromEvent(event);
  await createDbUser(userProps);
  return event;
};
