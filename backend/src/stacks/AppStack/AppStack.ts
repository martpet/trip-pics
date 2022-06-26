import { resolve } from 'app-root-path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Domains, StaticSite } from '~/constructs';
import { appEnvs, rootDomain, rootHostedZoneId, zoneDelegationRole } from '~/consts';
import { EnvName } from '~/types';

interface AppStackProps extends StackProps {
  envName: EnvName;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, { envName, ...props }: AppStackProps) {
    super(scope, id, props);

    const isProd = envName === 'Production';
    const { subDomain } = appEnvs[envName];

    const { hostedZone, certificate } = new Domains(this, 'Domains', {
      isProd,
      rootDomain,
      subDomain,
      rootHostedZoneId,
      zoneDelegationRole,
    });

    new StaticSite(this, 'ReactApp', {
      distPath: resolve('frontend/dist'),
      hostedZone,
      certificate,
    });
  }
}
