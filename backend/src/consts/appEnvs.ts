import { Environment } from 'aws-cdk-lib';

import { appRegion } from '~/consts';
import { EnvName } from '~/types';
import { getOrGeneratesubdomainName } from '~/utils';

export interface AppEnv {
  subDomain?: string;
  env?: Environment;
}

export const appEnvs: Record<EnvName, AppEnv> = {
  Production: {
    env: {
      account: '766373560006',
      region: appRegion,
    },
  },

  Staging: {
    subDomain: 'test',
    env: {
      account: '204115048155',
      region: appRegion,
    },
  },

  Personal: {
    subDomain: getOrGeneratesubdomainName(),
  },
};
