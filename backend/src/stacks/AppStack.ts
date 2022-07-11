import { resolve } from 'app-root-path';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppZone, Auth, WebDeployment, WebDistribution } from '~/constructs';
import { AppEnv, authSubdomain, oauthScopes } from '~/consts';
import { StackOutput } from '~/types';

interface AppStackProps extends StackProps {
  appEnv: AppEnv;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, { appEnv, ...props }: AppStackProps) {
    super(scope, id, props);

    const {
      envDomain,
      healthCheckAlarmEmails,
      hostedZoneId,
      crossAccountParentHostedZone,
    } = appEnv;

    const { hostedZone, certificate } = new AppZone(this, 'AppZone', {
      envDomain,
      hostedZoneId,
      crossAccountParentHostedZone,
      healthCheckAlarmEmails,
    });

    const cdn = new WebDistribution(this, 'WebDistribution', {
      hostedZone,
      envDomain,
      certificate,
    });

    const auth = new Auth(this, 'Auth', {
      envDomain,
      authSubdomain,
      hostedZone,
      certificate,
      oauthScopes,
    });

    auth.node.addDependency(cdn);

    const stackOutput: StackOutput = {
      userPoolClientId: auth.userPoolClientId,
      authDomain: auth.authDomain,
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
