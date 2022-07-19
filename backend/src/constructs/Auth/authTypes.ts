import { CognitoUserProps } from '~/types';

export { CognitoUserProps, TableItem } from '~/types';

export type MutableCognitoUsersProps = Pick<
  CognitoUserProps,
  'givenName' | 'familyName' | 'picture' | 'email'
>;

export interface CognitoIdentity {
  userId: string;
  providerName: string;
  providerType: string;
  primary: boolean;
  dateCreated: number;
}
