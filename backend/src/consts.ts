import { Environment } from 'aws-cdk-lib';

import { PipelineDeploymentProps } from '~/types';

import packageJson from '../../package.json';

export const nodejs = packageJson.engines.node;

export const appName = 'TripPics';
export const sourceRepo = 'martpet/trip-pics';
export const region = 'eu-central-1';

export const pipelineStackEnv: Environment = {
  account: '791346621844',
  region,
};

export const productionPipelineProps: PipelineDeploymentProps = {
  pipelineName: 'Production',
  sourceBranch: 'main',
  stageEnv: {
    account: '766373560006',
    region,
  },
};

export const stagingPipelineProps: PipelineDeploymentProps = {
  pipelineName: 'Staging',
  sourceBranch: 'develop',
  stageEnv: {
    account: '204115048155',
    region,
  },
};

export const connectionArn =
  'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';
