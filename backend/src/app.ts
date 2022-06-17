import { App } from 'aws-cdk-lib';

import { AppStack, PipelineStack } from '~/stacks';

const app = new App();
const appName = 'TripPics';
const region = 'eu-central-1';

new PipelineStack(app, 'pipeline', {
  stackName: `${appName}-PipelineStack`,
  env: {
    account: '791346621844',
    region,
  },
  deployments: [
    {
      envName: 'Production',
      branch: 'main',
      env: {
        account: '766373560006',
        region,
      },
    },
    {
      envName: 'Staging',
      branch: 'develop',
      env: {
        account: '204115048155',
        region,
      },
    },
  ],
});

new AppStack(app, 'dev', {
  stackName: `${appName}-Dev-AppStack`,
});
