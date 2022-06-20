import { App } from 'aws-cdk-lib';

import { appName } from '~/consts';
import { AppStack } from '~/stacks';

const app = new App();

new AppStack(app, 'app', {
  stackName: appName,
});
