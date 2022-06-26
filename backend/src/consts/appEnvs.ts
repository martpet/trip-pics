import { Environment } from 'aws-cdk-lib';

import { appRegion } from '~/consts';
import { EnvName } from '~/types';
import { getOrGenerateSubdomainName } from '~/utils';

export interface AppEnv {
  envName: EnvName;
  subDomain?: string;
}

export interface AppEnvWithAWSEnv extends AppEnv {
  env?: Environment;
}

export const appEnvs: AppEnvWithAWSEnv[] = [
  {
    envName: 'Production',
    env: {
      account: '766373560006',
      region: appRegion,
    },
  },
  {
    envName: 'Staging',
    subDomain: 'test',
    env: {
      account: '204115048155',
      region: appRegion,
    },
  },
  {
    envName: 'Personal',
    subDomain: getOrGenerateSubdomainName(),
  },
];
