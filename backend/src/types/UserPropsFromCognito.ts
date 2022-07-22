import { UserProps } from '~/types';

export type UserPropsFromCognito = Pick<UserProps, UserPropNamesInCognito>;

export type UserPropNamesInCognito = Extract<
  keyof UserProps,
  | 'username'
  | 'sub'
  | 'providerName'
  | 'givenName'
  | 'familyName'
  | 'picture'
  | 'email'
  | 'dateCreated'
>;
