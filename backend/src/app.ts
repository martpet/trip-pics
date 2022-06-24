import { App } from 'aws-cdk-lib';

import { AppEnv, appEnvs, appName } from '~/consts';
import { AppStack } from '~/stacks';
import { EnvName } from '~/types';

const app = new App();

const stacks = Object.entries(appEnvs) as Array<[EnvName, AppEnv]>;

stacks.forEach(([envName, { env, subDomain }]) => {
  if (envName === 'Personal' && !subDomain) {
    return;
  }
  new AppStack(app, envName, {
    stackName: `${appName}${envName}`,
    envName,
    env,
  });
});
