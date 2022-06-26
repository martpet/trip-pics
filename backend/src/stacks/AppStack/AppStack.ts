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

    const { appDomain, appDomainCertificate } = new Domains(this, 'Domains', {
      isProd: envName === 'Production',
      rootDomain,
      rootHostedZoneId,
      envSubDomain: appEnvs[envName].subDomain,
      zoneDelegationRole,
    });

    new StaticSite(this, 'ReactApp', {
      distPath: '../../../../frontend/dist',
      domainName: appDomain,
      certificate: appDomainCertificate,
    });
  }
}
