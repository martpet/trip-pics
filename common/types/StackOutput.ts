import { stackName } from '~/consts';

export interface StackOutput {
  userPoolClientId: string;
  authDomain: string;
}

export interface CdkOutput {
  [stackName]: StackOutput;
}
