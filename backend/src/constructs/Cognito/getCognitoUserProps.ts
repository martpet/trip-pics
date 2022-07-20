import { PostAuthenticationTriggerEvent, PostConfirmationTriggerEvent } from 'aws-lambda';

import { CognitoIdentity, CognitoUserProps } from './cognitoTypes';

type Event = PostConfirmationTriggerEvent | PostAuthenticationTriggerEvent;

export const getCognitoUserProps = (event: Event) => {
  const { userAttributes } = event.request;
  const identity = JSON.parse(userAttributes.identities)[0] as CognitoIdentity;

  const props: CognitoUserProps = {
    username: event.userName,
    sub: userAttributes.sub,
    provider: identity.providerName as CognitoUserProps['provider'],
    givenName: userAttributes.given_name,
    familyName: userAttributes.family_name,
    picture: userAttributes.picture,
    email: userAttributes.email,
    dateCreated: identity.dateCreated,
  };

  return props;
};
