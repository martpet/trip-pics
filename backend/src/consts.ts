import packageJson from '../../package.json';

export const nodejsVersion = packageJson.engines.node;

export const appName = 'TripPics';
export const sourceRepo = 'martpet/trip-pics';
export const region = 'eu-central-1';

export const pipelineEnv = {
  account: '791346621844',
  region,
};

export const prodPipelineProps = {
  envName: 'Production',
  sourceBranch: 'main',
  stageEnv: {
    account: '766373560006',
    region,
  },
};

export const stagingPipelineProps = {
  envName: 'Staging',
  sourceBranch: 'staging',
  stageEnv: {
    account: '204115048155',
    region,
  },
};

export const connectionArn =
  'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';
