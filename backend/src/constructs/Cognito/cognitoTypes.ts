import { UserPropsFromCognito } from '~/types';

export { TableItem, UserPropsFromCognito } from '~/types';

export type MutableCognitoUserProps = Pick<
  UserPropsFromCognito,
  'givenName' | 'familyName' | 'picture' | 'email'
>;

export interface CognitoIdentity {
  userId: string;
  providerName: string;
  providerType: string;
  primary: boolean;
  dateCreated: number;
}
