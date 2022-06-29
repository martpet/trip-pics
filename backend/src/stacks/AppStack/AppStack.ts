import { resolve } from 'app-root-path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppDomains, StaticSite } from '~/constructs';
import { AppEnv, rootDomain, rootHostedZoneId, zoneDelegationRole } from '~/consts';

interface AppStackProps extends StackProps {
  appEnv: AppEnv;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, { appEnv, ...props }: AppStackProps) {
    super(scope, id, props);

    const { envName, envSubdomain, healthCheckAlertEmails } = appEnv;
    const isProd = envName === 'Production';

    const { hostedZone, certificate } = new AppDomains(this, 'Domains', {
      rootDomain,
      envSubdomain,
      rootHostedZoneId,
      zoneDelegationRole,
      healthCheckAlertEmails,
      isProd,
    });

    new StaticSite(this, 'ReactApp', {
      distPath: resolve('frontend/dist'),
      hostedZone,
      certificate,
      isProd,
    });
  }
}
