import { UserPropsFromCognitoEvent } from '~/types';

export { ProviderName, UserPropsFromCognitoEvent, UsersTable } from '~/types';

export type MutableCognitoUserProps = Pick<
  UserPropsFromCognitoEvent,
  'givenName' | 'familyName' | 'picture' | 'email'
>;

export interface CognitoIdentity {
  userId: string;
  providerName: string;
  providerType: string;
  primary: boolean;
  dateCreated: number;
}
