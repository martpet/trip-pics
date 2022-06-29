import { Environment } from 'aws-cdk-lib';

import {
  prodAccountId,
  prodHealthCheckAlertEmails,
  region,
  stagingAccountId,
  stagingHealthCheckAlertEmails,
} from '~/consts';
import { EnvName } from '~/types';
import { getOrGenerateSubdomainName } from '~/utils';

export interface AppEnv {
  envName: EnvName;
  envSubdomain?: string;
  healthCheckAlertEmails?: string[];
}

export interface AppEnvWithAWSEnv extends AppEnv {
  env?: Environment;
}

export const appEnvs: AppEnvWithAWSEnv[] = [
  {
    envName: 'Production',
    env: { account: prodAccountId, region },
    healthCheckAlertEmails: prodHealthCheckAlertEmails,
  },
  {
    envName: 'Staging',
    envSubdomain: 'test',
    env: { account: stagingAccountId, region },
    healthCheckAlertEmails: stagingHealthCheckAlertEmails,
  },
  {
    envName: 'Personal',
    envSubdomain: `${getOrGenerateSubdomainName()}.dev`,
  },
];
