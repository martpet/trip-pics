import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Website } from '~/constructs';
import { EnvName } from '~/types';

interface AppStackProps extends StackProps {
  envName: EnvName;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id, props);

    new Website(this, 'ReactApp', {
      distPath: '../../../../frontend/dist',
    });
  }
}
