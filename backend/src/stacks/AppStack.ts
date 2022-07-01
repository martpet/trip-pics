import { resolve } from 'app-root-path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppZone, StaticSite } from '~/constructs';
import { AppEnv, rootDomain } from '~/consts';

interface AppStackProps extends StackProps {
  appEnv: AppEnv;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, { appEnv, ...props }: AppStackProps) {
    super(scope, id, props);

    const {
      envName,
      envSubdomain,
      healthCheckAlarmEmails,
      hostedZoneId,
      crossAccountParentHostedZone,
    } = appEnv;

    const isProd = envName === 'Production';

    const { hostedZone, domainName, certificate } = new AppZone(this, 'AppZone', {
      isProd,
      rootDomain,
      envSubdomain,
      hostedZoneId,
      crossAccountParentHostedZone,
      healthCheckAlarmEmails,
    });

    new StaticSite(this, 'ReactApp', {
      distPath: resolve('frontend/dist'),
      hostedZone,
      domainName,
      certificate,
    });
  }
}
