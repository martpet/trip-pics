export type UsersTable = UserPropsFromCognitoEvent;

export interface UserPropsFromCognitoEvent {
  username: string;
  sub: string;
  providerName: ProviderName;
  givenName: string;
  familyName: string;
  picture?: string;
  email: string;
  dateCreated: number;
}

export type ProviderName = 'SignInWithApple' | 'Google';
