import { App } from 'aws-cdk-lib';

import { AppStack } from '~/app-stack';
import {
  appName,
  pipelineStackEnv,
  productionPipelineProps,
  stagingPipelineProps,
} from '~/consts';
import { PipelineStack } from '~/pipeline-stack';

const app = new App();

new PipelineStack(app, 'pipeline', {
  stackName: `${appName}-PipelineStack`,
  env: pipelineStackEnv,
  pipelines: [productionPipelineProps, stagingPipelineProps],
});

new AppStack(app, 'dev', {
  stackName: `${appName}-Dev-AppStack`,
});
