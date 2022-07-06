import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppEnv } from '~/consts';
import { AppStack } from '~/stacks';
import { EnvName } from '~/types';

interface DeploymentStageProps extends StageProps {
  appEnv: AppEnv;
  envName: EnvName;
}

export class DeploymentStage extends Stage {
  constructor(
    scope: Construct,
    id: string,
    { appEnv, envName, ...props }: DeploymentStageProps
  ) {
    super(scope, id, props);

    new AppStack(this, 'App', { appEnv, envName });
  }
}
