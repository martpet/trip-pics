import { App } from 'aws-cdk-lib';

import { appName, envNames } from '~/consts';
import { AppStack } from '~/stacks';

const app = new App();

envNames.forEach((envName) => {
  new AppStack(app, `${envName}App`, {
    stackName: appName,
    envName,
  });
});
