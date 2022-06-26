import { App } from 'aws-cdk-lib';

import { appEnvs, appName } from '~/consts';
import { AppStack } from '~/stacks';

const app = new App();

appEnvs.forEach(({ env, ...appEnv }) => {
  const { envName } = appEnv;
  new AppStack(app, envName, {
    stackName: `${appName}${envName}`,
    env,
    appEnv,
  });
});
