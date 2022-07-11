import { Environment } from 'aws-cdk-lib';

import {
  devHostedZoneDelegationRoleArn,
  devHostedZoneId,
  healthCheckAlarmEmailsProd,
  healthCheckAlarmEmailsStaging,
  prodAccountId,
  region,
  rootDomain,
  rootHostedZoneId,
  stagingAccountId,
  stagingHostedZoneId,
} from '~/consts';
import { EnvName } from '~/types';
import { getPersonalDevSubdomain } from '~/utils';

export interface CommonAppEnvProps {
  envDomain: string;
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

export const appEnvs: Record<EnvName, AppEnvWithAWSEnv> = {
  Production: {
    envDomain: rootDomain,
    healthCheckAlarmEmails: healthCheckAlarmEmailsProd,
    hostedZoneId: rootHostedZoneId,
    env: {
      account: prodAccountId,
      region,
    },
  },
  Staging: {
    envDomain: `test.${rootDomain}`,
    healthCheckAlarmEmails: healthCheckAlarmEmailsStaging,
    hostedZoneId: stagingHostedZoneId,
    env: {
      account: stagingAccountId,
      region,
    },
  },
  Personal: {
    envDomain: `${getPersonalDevSubdomain()}.dev.${rootDomain}`,
    crossAccountParentHostedZone: {
      zoneId: devHostedZoneId,
      roleArn: devHostedZoneDelegationRoleArn,
    },
  },
};
