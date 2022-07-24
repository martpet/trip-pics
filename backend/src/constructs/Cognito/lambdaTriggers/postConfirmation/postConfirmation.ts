import { PostConfirmationTriggerHandler } from 'aws-lambda';

import { createUserFromEvent } from './createUserFromEvent';

export const handler: PostConfirmationTriggerHandler = async (event) => {
  createUserFromEvent(event);
  return event;
};
