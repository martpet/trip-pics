import { PostAuthenticationTriggerEvent } from 'aws-lambda';

const event = {
  version: '1',
  region: 'eu-central-1',
  userPoolId: 'someuserpoolid',
  userName: 'someuser',
  callerContext: {
    awsSdkVersion: 'aws-sdk-unknown-unknown',
    clientId: 'j3h24l12jh34',
  },
  triggerSource: 'PostAuthentication_Authentication',
  request: {
    userAttributes: {
      sub: 'lkjasdflk-adslfkj-asdfasd',
      email_verified: 'false',
      'cognito:user_status': 'EXTERNAL_PROVIDER',
      identities:
        '[{"userId":"182347123047012","providerName":"Google","providerType":"Google","issuer":null,"primary":true,"dateCreated":1658487089823}]',
      given_name: 'John',
      family_name: 'Doe',
      email: 'name@email.com',
      picture: 'https://lh3.googleusercontent.com/a/asdf',
    },
    newDeviceUsed: false,
  },
  response: {},
} as PostAuthenticationTriggerEvent;

export default event;
