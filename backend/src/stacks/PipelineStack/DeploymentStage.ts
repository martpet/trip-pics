import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppStack } from '~/stacks';
import { EnvName } from '~/types';

interface DeploymentStageProps extends StageProps {
  envName: EnvName;
}

export class DeploymentStage extends Stage {
  constructor(scope: Construct, id: string, { envName, ...props }: DeploymentStageProps) {
    super(scope, id, props);

    new AppStack(this, 'App', { envName });
  }
}
