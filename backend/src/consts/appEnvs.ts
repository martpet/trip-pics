import { Environment } from 'aws-cdk-lib';

import { healthCheckAlertEmails, prodAccountId, region, testAccountId } from '~/consts';
import { EnvName } from '~/types';
import { getOrGenerateSubdomainName } from '~/utils';

export interface AppEnv {
  envName: EnvName;
  subDomain?: string;
  healthCheckAlertEmails?: string[];
}

export interface AppEnvWithAWSEnv extends AppEnv {
  env?: Environment;
}

export const appEnvs: AppEnvWithAWSEnv[] = [
  {
    envName: 'Production',
    env: { account: prodAccountId, region },
    healthCheckAlertEmails,
  },
  {
    envName: 'Staging',
    subDomain: 'test',
    env: { account: testAccountId, region },
  },
  {
    envName: 'Personal',
    subDomain: getOrGenerateSubdomainName(),
  },
];
