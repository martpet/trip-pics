import { App } from 'aws-cdk-lib';

import { AppEnv, appEnvs, appName } from '~/consts';
import { AppStack } from '~/stacks';
import { EnvName } from '~/types';

const app = new App();

const envs = Object.entries(appEnvs) as Array<[EnvName, AppEnv]>;

envs.forEach(([envName, { env }]) => {
  new AppStack(app, envName, {
    stackName: `${appName}${envName}`,
    envName,
    env,
  });
});
