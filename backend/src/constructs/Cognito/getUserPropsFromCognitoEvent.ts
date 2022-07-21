import { PostAuthenticationTriggerEvent, PostConfirmationTriggerEvent } from 'aws-lambda';

import { CognitoIdentity, ProviderName, UserPropsFromCognitoEvent } from './cognitoTypes';

export const getUserPropsFromCognitoEvent = (
  event: PostConfirmationTriggerEvent | PostAuthenticationTriggerEvent
) => {
  const { userAttributes } = event.request;
  const identity = JSON.parse(userAttributes.identities)[0] as CognitoIdentity;

  const props: UserPropsFromCognitoEvent = {
    username: event.userName,
    sub: userAttributes.sub,
    providerName: identity.providerName as ProviderName,
    givenName: userAttributes.given_name,
    familyName: userAttributes.family_name,
    picture: userAttributes.picture,
    email: userAttributes.email,
    dateCreated: identity.dateCreated,
  };

  return props;
};
