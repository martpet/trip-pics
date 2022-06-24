import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { HostedZones, Website } from '~/constructs';
import { appDomain, certificateArn, crossAccountZoneDelegationRoleArn } from '~/consts';
import { EnvName } from '~/types';

interface AppStackProps extends StackProps {
  envName: EnvName;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, { envName, ...props }: AppStackProps) {
    super(scope, id, props);

    const { websiteDomain } = new HostedZones(this, 'HostedZones', {
      appDomain,
      isStaging: envName === 'Staging',
      crossAccountZoneDelegationRoleArn,
    });

    new Website(this, 'ReactApp', {
      distPath: '../../../../frontend/dist',
      domainName: websiteDomain,
      certificateArn,
    });
  }
}
