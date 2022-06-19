import { App } from 'aws-cdk-lib';

import { appName, appRegion } from '~/consts';
import { AppStack, PipelineStack } from '~/stacks';

const app = new App();

new PipelineStack(app, 'pipeline', {
  stackName: `${appName}-Pipeline`,
  env: {
    account: '791346621844',
    region: appRegion,
  },
});

new AppStack(app, 'dev', {
  stackName: `${appName}-Dev-App`,
});
