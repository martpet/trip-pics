import { Environment } from 'aws-cdk-lib';

import { appRegion } from '~/consts';
import { EnvName } from '~/types';

type DeploymentOptions = Record<
  Exclude<EnvName, 'Personal'>,
  {
    gitBranch: string;
    env: Required<Environment>;
  }
>;

export const deployments: DeploymentOptions = {
  Production: {
    gitBranch: 'main',
    env: {
      account: '766373560006',
      region: appRegion,
    },
  },
  Staging: {
    gitBranch: 'staging',
    env: {
      account: '204115048155',
      region: appRegion,
    },
  },
};
