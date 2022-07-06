import { App } from 'aws-cdk-lib';

import { appEnvs, stackName } from '~/consts';
import { AppStack } from '~/stacks';
import { EnvName } from '~/types';

const app = new App();
const envName = app.node.tryGetContext('envName') as EnvName;

if (!envName) {
  throw Error('Passing envName to CDK context is required');
}

const { env, ...appEnv } = appEnvs[envName];

new AppStack(app, stackName, {
  stackName,
  envName,
  appEnv,
  env,
});
