import { App } from 'aws-cdk-lib';

import { AppStack } from '~/app-stack';
import { PipelineStack } from '~/pipeline';

const app = new App();
const repo = 'martpet/trip-pics';
const region = 'eu-central-1';
const connectionArn =
  'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';

const prodPipelineProps = {
  name: 'production',
  branch: 'main',
  repo,
  connectionArn,
  env: {
    account: '766373560006',
    region,
  },
};

const stagingPipelineProps = {
  name: 'staging',
  branch: 'staging',
  repo,
  connectionArn,
  env: {
    account: '204115048155',
    region,
  },
};

new PipelineStack(app, 'PipelineStack', {
  pipelines: [prodPipelineProps, stagingPipelineProps],
  env: {
    account: '791346621844',
    region,
  },
});

new AppStack(app, 'dev', {
  stackName: 'TripPics',
});
