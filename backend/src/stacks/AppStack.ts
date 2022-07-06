import { resolve } from 'app-root-path';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppZone, Auth, WebDeployment, WebDistribution } from '~/constructs';
import { AppEnv, authSubdomain, oauthScopes, rootDomain } from '~/consts';
import { EnvName, StackOutput } from '~/types';

interface AppStackProps extends StackProps {
  appEnv: AppEnv;
  envName: EnvName;
}

export class AppStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    { appEnv, envName, ...props }: AppStackProps
  ) {
    super(scope, id, props);

    const {
      envSubdomain,
      healthCheckAlarmEmails,
      hostedZoneId,
      crossAccountParentHostedZone,
    } = appEnv;

    const isProd = envName === 'Production';

    const { appDomain, hostedZone, certificate } = new AppZone(this, 'AppZone', {
      isProd,
      rootDomain,
      envSubdomain,
      hostedZoneId,
      crossAccountParentHostedZone,
      healthCheckAlarmEmails,
    });

    const cdn = new WebDistribution(this, 'WebDistribution', {
      hostedZone,
      appDomain,
      certificate,
    });

    const auth = new Auth(this, 'Auth', {
      appDomain,
      authSubdomain,
      hostedZone,
      certificate,
      oauthScopes,
    });

    auth.node.addDependency(cdn);

    const stackOutput: StackOutput = {
      userPoolClientId: auth.userPoolClientId,
      // Todo: remove authDomain from outputs
      authDomain: auth.domainName,
    };

    new WebDeployment(this, 'ReactApp', {
      distPath: resolve('frontend/dist'),
      distribution: cdn.distribution,
      bucket: cdn.bucket,
      stackOutput,
    });

    Object.entries(stackOutput).forEach(([key, value]) => {
      new CfnOutput(this, key, { value });
    });
  }
}
