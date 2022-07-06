import { Environment } from 'aws-cdk-lib';

import {
  devHostedZoneDelegationRoleArn,
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

// Todo - export whole domains (devDomain, testDomain, authDomain) from common/consts/domains.
// (so not to import authDomain from stack outputs)
export const appEnvs: Record<EnvName, AppEnvWithAWSEnv> = {
  Production: {
    healthCheckAlarmEmails: healthCheckAlarmEmailsProd,
    hostedZoneId: rootHostedZoneId,
    env: {
      account: prodAccountId,
      region,
    },
  },
  Staging: {
    envSubdomain: 'test',
    healthCheckAlarmEmails: healthCheckAlarmEmailsStaging,
    hostedZoneId: stagingHostedZoneId,
    env: {
      account: stagingAccountId,
      region,
    },
  },
  Personal: {
    envSubdomain: `${getOrGenerateSubdomainName()}.dev`,
    crossAccountParentHostedZone: {
      zoneId: devHostedZoneId,
      roleArn: devHostedZoneDelegationRoleArn,
    },
  },
};
