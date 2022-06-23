import { Environment } from 'aws-cdk-lib';

import { appRegion } from '~/consts';
import { EnvName } from '~/types';

type DeploymentEnvName = Exclude<EnvName, 'Personal'>;

type DeploymentOptions = {
  gitBranch: string;
  env: Required<Environment>;
};

const region = appRegion;

export const deployments: Record<DeploymentEnvName, DeploymentOptions> = {
  Staging: {
    gitBranch: 'main',
    env: {
      account: '204115048155',
      region,
    },
  },
  Production: {
    gitBranch: 'prod',
    env: {
      account: '766373560006',
      region,
    },
  },
};
