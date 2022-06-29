import { Environment } from 'aws-cdk-lib';

import {
  crossAccountDevHostedZoneRole,
  crossAccountRootHostedZoneRole,
  devSubdomain,
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
  crossAccountHostedZoneRole?: string;
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
    env: { account: stagingAccountId, region },
    envSubdomain: 'test',
    healthCheckAlertEmails: stagingHealthCheckAlertEmails,
    crossAccountHostedZoneRole: crossAccountRootHostedZoneRole,
  },
  {
    envName: 'Personal',
    envSubdomain: `${getOrGenerateSubdomainName()}.${devSubdomain}`,
    crossAccountHostedZoneRole: crossAccountDevHostedZoneRole,
  },
];
