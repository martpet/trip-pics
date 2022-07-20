export type UsersTable = UserPropsFromCognito;

export interface UserPropsFromCognito {
  username: string;
  sub: string;
  provider: 'SignInWithApple' | 'Google';
  givenName: string;
  familyName: string;
  picture: string;
  email: string;
  dateCreated: number;
}
