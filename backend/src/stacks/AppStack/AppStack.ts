import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { FrontendWebsite } from '~/constructs';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new FrontendWebsite(this, 'ReactApp', {
      distPath: '../../../../frontend/dist',
    });
  }
}
