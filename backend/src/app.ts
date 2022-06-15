import { App } from 'aws-cdk-lib';

import { AppStack } from '~/app-stack';
import {
  appName,
  pipelineAccount,
  productionAccount,
  region,
  stagingAccount,
} from '~/consts';
import { PipelineStack } from '~/pipeline-stack';

const app = new App();

new PipelineStack(app, 'pipeline', {
  stackName: `${appName}-PipelineStack`,
  env: {
    account: pipelineAccount,
    region,
  },
  pipelines: [
    {
      envName: 'production',
      sourceBranch: 'main',
      account: productionAccount,
    },
    {
      envName: 'staging',
      sourceBranch: 'staging',
      account: stagingAccount,
    },
  ],
});

new AppStack(app, 'dev', {
  stackName: `${appName}-Dev-AppStack`,
});
