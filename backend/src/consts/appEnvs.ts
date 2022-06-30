import { Environment } from 'aws-cdk-lib';

import {
  crossAccountDevHostedZoneRole,
  crossAccountRootHostedZoneRole,
  devSubdomain,
  healthCheckAlarmEmailsProd,
  healthCheckAlarmEmailsStaging,
  prodAccountId,
  region,
  stagingAccountId,
} from '~/consts';
import { EnvName } from '~/types';
import { getOrGenerateSubdomainName } from '~/utils';

export interface AppEnv {
  envName: EnvName;
  envSubdomain?: string;
  healthCheckAlarmEmails?: string[];
  crossAccountHostedZoneRole?: string;
}

export interface AppEnvWithAWSEnv extends AppEnv {
  env?: Environment;
}

export const appEnvs: AppEnvWithAWSEnv[] = [
  {
    envName: 'Production',
    env: { account: prodAccountId, region },
    healthCheckAlarmEmails: healthCheckAlarmEmailsProd,
  },
  {
    envName: 'Staging',
    env: { account: stagingAccountId, region },
    envSubdomain: 'test',
    healthCheckAlarmEmails: healthCheckAlarmEmailsStaging,
    crossAccountHostedZoneRole: crossAccountRootHostedZoneRole,
  },
  {
    envName: 'Personal',
    envSubdomain: `${getOrGenerateSubdomainName()}.${devSubdomain}`,
    crossAccountHostedZoneRole: crossAccountDevHostedZoneRole,
  },
];
