import { App } from 'aws-cdk-lib';

import { appName, deployments } from '~/consts';
import { AppStack } from '~/stacks';
import { EnvName } from '~/types';

const app = new App();

Object.entries(deployments).forEach(([envName, { env }]) => {
  new AppStack(app, envName, {
    stackName: `${appName}${envName}`,
    envName: envName as EnvName,
    env,
  });
});

new AppStack(app, 'personal', {
  stackName: appName,
  envName: 'Personal',
});
