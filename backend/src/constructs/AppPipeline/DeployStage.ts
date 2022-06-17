import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppStack } from '~/stacks/AppStack';

export class DeployStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new AppStack(this, 'AppStack');
  }
}
