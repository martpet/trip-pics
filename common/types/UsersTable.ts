export interface UsersTable extends CognitoUserProps {}

export interface CognitoUserProps {
  username: string;
  sub: string;
  provider: 'SignInWithApple' | 'Google';
  givenName: string;
  familyName: string;
  picture: string;
  email: string;
  dateCreated: number;
}
