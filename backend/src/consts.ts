import { Environment } from 'aws-cdk-lib';

import { AppPipelineProps } from '~/constructs/AppPipeline/AppPipeline';

import packageJson from '../../package.json';

export const nodejs = packageJson.engines.node;

export const appName = 'TripPics';
export const sourceRepo = 'martpet/trip-pics';
export const region = 'eu-central-1';

export const pipelineStackEnv: Environment = {
  account: '791346621844',
  region,
};

export const prodPipelineProps: AppPipelineProps = {
  name: 'Production',
  branch: 'main',
  env: {
    account: '766373560006',
    region,
  },
};

export const stagingPipelineProps: AppPipelineProps = {
  name: 'Staging',
  branch: 'develop',
  env: {
    account: '204115048155',
    region,
  },
};

export const connectionArn =
  'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';
