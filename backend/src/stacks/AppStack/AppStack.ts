import { resolve } from 'app-root-path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppDomains, StaticSite } from '~/constructs';
import { AppEnv, devHostedZoneId, rootDomain, rootHostedZoneId } from '~/consts';

interface AppStackProps extends StackProps {
  appEnv: AppEnv;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, { appEnv, ...props }: AppStackProps) {
    super(scope, id, props);

    const { envName, envSubdomain, healthCheckAlertEmails, crossAccountHostedZoneRole } =
      appEnv;

    const isProd = envName === 'Production';
    const isDev = envName === 'Personal';

    const { hostedZone, certificate } = new AppDomains(this, 'Domains', {
      rootDomain,
      envSubdomain,
      rootHostedZoneId,
      devHostedZoneId,
      crossAccountHostedZoneRole,
      healthCheckAlertEmails,
      isProd,
      isDev,
    });

    new StaticSite(this, 'ReactApp', {
      distPath: resolve('frontend/dist'),
      hostedZone,
      certificate,
    });
  }
}
