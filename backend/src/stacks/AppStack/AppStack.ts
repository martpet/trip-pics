import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Website } from '~/constructs';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Website(this, 'ReactApp', {
      distPath: '../../../../frontend/dist',
    });
  }
}
