import { App } from 'aws-cdk-lib';

import {
  appName,
  pipelineStackEnv,
  prodPipelineProps,
  stagingPipelineProps,
} from '~/consts';
import { AppStack, PipelineStack } from '~/stacks';

const app = new App();

new PipelineStack(app, 'pipeline', {
  stackName: `${appName}-PipelineStack`,
  env: pipelineStackEnv,
  pipelinesProps: [prodPipelineProps, stagingPipelineProps],
});

new AppStack(app, 'dev', {
  stackName: `${appName}-Dev-AppStack`,
});
