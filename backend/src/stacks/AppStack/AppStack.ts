import { resolve } from 'app-root-path';
import { App, Stack, StackProps } from 'aws-cdk-lib';

import { Domains, StaticSite } from '~/constructs';
import { AppEnv, rootDomain, rootHostedZoneId, zoneDelegationRole } from '~/consts';

interface AppStackProps extends StackProps {
  appEnv: AppEnv;
}

export class AppStack extends Stack {
  constructor(scope: App, id: string, { appEnv, ...props }: AppStackProps) {
    super(scope, id, props);

    const { envName, subDomain, healthCheckAlertEmails } = appEnv;
    const isProd = envName === 'Production';

    const { hostedZone, certificate } = new Domains(this, 'Domains', {
      rootDomain,
      subDomain,
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
