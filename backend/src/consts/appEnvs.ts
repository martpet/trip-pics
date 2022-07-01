import { Environment } from 'aws-cdk-lib';

import {
  devCrossAccountZoneDelegationRoleArn,
  devHostedZoneId,
  healthCheckAlarmEmailsProd,
  healthCheckAlarmEmailsStaging,
  prodAccountId,
  region,
  rootHostedZoneId,
  stagingAccountId,
  stagingHostedZoneId,
} from '~/consts';
import { EnvName } from '~/types';
import { getOrGenerateSubdomainName } from '~/utils';

export interface CommonAppEnvProps {
  envName: EnvName;
  envSubdomain?: string;
  healthCheckAlarmEmails?: string[];
}

interface WithExistingHostedZone extends CommonAppEnvProps {
  hostedZoneId: string;
  crossAccountParentHostedZone?: never;
}

interface WithoutExistingHostedZone extends CommonAppEnvProps {
  hostedZoneId?: never;
  crossAccountParentHostedZone: {
    zoneId: string;
    roleArn: string;
  };
}

export type AppEnv = WithExistingHostedZone | WithoutExistingHostedZone;

export type AppEnvWithAWSEnv = AppEnv & {
  env?: Environment;
};

export const appEnvs: AppEnvWithAWSEnv[] = [
  {
    envName: 'Production',
    healthCheckAlarmEmails: healthCheckAlarmEmailsProd,
    hostedZoneId: rootHostedZoneId,
    env: {
      account: prodAccountId,
      region,
    },
  },
  {
    envName: 'Staging',
    envSubdomain: 'test',
    healthCheckAlarmEmails: healthCheckAlarmEmailsStaging,
    hostedZoneId: stagingHostedZoneId,
    env: {
      account: stagingAccountId,
      region,
    },
  },
  {
    envName: 'Personal',
    envSubdomain: `${getOrGenerateSubdomainName()}.dev`,
    crossAccountParentHostedZone: {
      zoneId: devHostedZoneId,
      roleArn: devCrossAccountZoneDelegationRoleArn,
    },
  },
];
