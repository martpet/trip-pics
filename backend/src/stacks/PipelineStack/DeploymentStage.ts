import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppEnv } from '~/consts';
import { AppStack } from '~/stacks';

interface DeploymentStageProps extends StageProps {
  appEnv: AppEnv;
}

export class DeploymentStage extends Stage {
  constructor(scope: Construct, id: string, { appEnv, ...props }: DeploymentStageProps) {
    super(scope, id, props);

    new AppStack(this, 'App', { appEnv });
  }
}
