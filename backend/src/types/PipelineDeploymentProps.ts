import { Environment } from 'aws-cdk-lib';

export interface PipelineDeploymentProps {
  pipelineName: string;
  sourceBranch: string;
  stageEnv: Environment;
}
