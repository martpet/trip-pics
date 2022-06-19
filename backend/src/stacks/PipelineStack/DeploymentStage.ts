import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppStack } from '~/stacks';

export class DeploymentStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new AppStack(this, 'App');
  }
}
