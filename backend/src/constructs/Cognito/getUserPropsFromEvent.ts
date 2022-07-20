import { PostAuthenticationTriggerEvent, PostConfirmationTriggerEvent } from 'aws-lambda';

import { CognitoIdentity, UserPropsFromCognito } from './cognitoTypes';

type Event = PostConfirmationTriggerEvent | PostAuthenticationTriggerEvent;

export const getUserPropsFromEvent = (event: Event) => {
  const { userAttributes } = event.request;
  const identity = JSON.parse(userAttributes.identities)[0] as CognitoIdentity;

  const props: UserPropsFromCognito = {
    username: event.userName,
    sub: userAttributes.sub,
    provider: identity.providerName as UserPropsFromCognito['provider'],
    givenName: userAttributes.given_name,
    familyName: userAttributes.family_name,
    picture: userAttributes.picture,
    email: userAttributes.email,
    dateCreated: identity.dateCreated,
  };

  return props;
};
