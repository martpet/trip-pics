import { PostConfirmationTriggerEvent } from 'aws-lambda';

const event = {
  version: '1',
  region: 'eu-central-1',
  userPoolId: 'someuserpoolid',
  userName: 'someuser',
  callerContext: {
    awsSdkVersion: 'aws-sdk-unknown-unknown',
    clientId: 'j3h24l12jh34',
  },
  triggerSource: 'PostConfirmation_ConfirmSignUp',
  request: {
    userAttributes: {
      sub: 'lkjasdflk-adslfkj-asdfasd',
      email_verified: 'false',
      'cognito:user_status': 'EXTERNAL_PROVIDER',
      identities:
        '[{"userId":"102975344697093363099","providerName":"Google","providerType":"Google","issuer":null,"primary":true,"dateCreated":1658604803064}]',
      given_name: 'John',
      family_name: 'Doe',
      email: 'name@email.com',
      picture: 'https://lh3.googleusercontent.com/a/asdf',
    },
  },
  response: {},
} as PostConfirmationTriggerEvent;

export default event;
