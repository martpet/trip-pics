import { App } from 'aws-cdk-lib';

import { AppStack } from '~/app-stack';
import { PipelineStack } from '~/pipeline-stack';

const app = new App();

new AppStack(app, 'dev', {
  stackName: 'TripPics',
});

new PipelineStack(app, 'PipelineStack', {
  env: {
    account: '791346621844',
    region: 'eu-central-1',
  },
});
