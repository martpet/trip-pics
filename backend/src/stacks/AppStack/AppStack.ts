import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { HostedZones, Website } from '~/constructs';
import { appDomain, crossAccountZoneDelegationRoleArn } from '~/consts';
import { EnvName } from '~/types';

interface AppStackProps extends StackProps {
  envName: EnvName;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, { envName, ...props }: AppStackProps) {
    super(scope, id, props);

    new HostedZones(this, 'HostedZones', {
      appDomain,
      isStaging: envName === 'Staging',
      delegationRoleArn: crossAccountZoneDelegationRoleArn,
    });

    new Website(this, 'ReactApp', {
      distPath: '../../../../frontend/dist',
    });
  }
}
