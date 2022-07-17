import { Environment } from 'aws-cdk-lib';

import {
  appleClientIdDev,
  appleClientIdProd,
  appleClientIdStaging,
  appleKeyIdDev,
  appleKeyIdProd,
  appleKeyIdStaging,
  devAccountServiceRoleArn,
  devHostedZoneId,
  googleClientIdDev,
  googleClientIdProd,
  googleClientIdStaging,
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

export interface CommonProps {
  envDomain: string;
  healthCheckAlarmEmails?: string[];
  googleClientId: string;
  appleClientId: string;
  appleKeyId: string;
  authSecretsAssumeRoleArn?: string;
}

interface WithParentHostedZone {
  parentHostedZoneId: string;
  hostedZoneId?: never;
}

interface WithoutParentHostedZone {
  parentHostedZoneId?: never;
  hostedZoneId: string;
}

export type AppEnv = CommonProps & (WithParentHostedZone | WithoutParentHostedZone);

export type AppEnvWithAWSEnv = AppEnv & { env?: Environment };

export const appEnvs: Record<EnvName, AppEnvWithAWSEnv> = {
  Production: {
    envDomain: rootDomain,
    healthCheckAlarmEmails: healthCheckAlarmEmailsProd,
    hostedZoneId: rootHostedZoneId,
    googleClientId: googleClientIdProd,
    appleClientId: appleClientIdProd,
    appleKeyId: appleKeyIdProd,
    env: {
      account: prodAccountId,
      region,
    },
  },
  Staging: {
    envDomain: `test.${rootDomain}`,
    healthCheckAlarmEmails: healthCheckAlarmEmailsStaging,
    hostedZoneId: stagingHostedZoneId,
    googleClientId: googleClientIdStaging,
    appleClientId: appleClientIdStaging,
    appleKeyId: appleKeyIdStaging,
    env: {
      account: stagingAccountId,
      region,
    },
  },
  Personal: {
    envDomain: `${getPersonalDevSubdomain()}.dev.${rootDomain}`,
    parentHostedZoneId: devHostedZoneId,
    googleClientId: googleClientIdDev,
    appleClientId: appleClientIdDev,
    appleKeyId: appleKeyIdDev,
    authSecretsAssumeRoleArn: devAccountServiceRoleArn,
  },
};
