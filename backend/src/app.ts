import { App } from 'aws-cdk-lib';

import { appEnvs, appName } from '~/consts';
import { AppStack } from '~/stacks';

const app = new App();

appEnvs.forEach(({ env, ...appEnv }) => {
  new AppStack(app, appEnv.envName, {
    stackName: `${appName}${appEnv.envName}`,
    appEnv,
    env,
  });
});
