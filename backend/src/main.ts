import { App } from 'aws-cdk-lib';

import { AppStack } from '~/app-stack';
import { PipelineStack } from '~/pipeline-stack';

const app = new App();
const region = 'eu-central-1';

new AppStack(app, 'dev', {
  stackName: 'TripPics',
});

new PipelineStack(app, 'PipelineStack', {
  env: { account: '791346621844', region },
  pipelines: [
    {
      name: 'production',
      branch: 'main',
      env: { account: '766373560006', region },
    },
    {
      name: 'staging',
      branch: 'staging',
      env: { account: '204115048155', region },
    },
  ],
});
