import { PostAuthenticationTriggerEvent, PostConfirmationTriggerEvent } from 'aws-lambda';

import { CognitoIdentity, ProviderName, UserPropsFromCognito } from '~/types';

export const getUserPropsFromCognitoEvent = (
  event: PostConfirmationTriggerEvent | PostAuthenticationTriggerEvent
): UserPropsFromCognito => {
  const { userAttributes } = event.request;
  const identity = JSON.parse(userAttributes.identities)[0] as CognitoIdentity;

  return {
    username: event.userName,
    sub: userAttributes.sub,
    providerName: identity.providerName as ProviderName,
    givenName: userAttributes.given_name,
    familyName: userAttributes.family_name,
    picture: userAttributes.picture,
    email: userAttributes.email,
    dateCreated: identity.dateCreated,
  };
};
