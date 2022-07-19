import { resolve } from 'app-root-path';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppZone, Cognito, Database, WebDeployment, WebDistribution } from '~/constructs';
import {
  AppEnv,
  applePrivateKeyParamName,
  appleTeamId,
  authSubdomain,
  devAccountServiceRoleArn,
  googleClientSecretParamName,
  localhostPort,
  stackName,
} from '~/consts';
import { CdkOutput, StackOutput } from '~/types';

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
      parentHostedZoneId,
      googleClientId,
      authSecretsAssumeRoleArn,
      appleClientId,
      appleKeyId,
    } = appEnv;

    const { hostedZone, certificate } = new AppZone(this, 'AppZone', {
      envDomain,
      hostedZoneId,
      parentHostedZoneId,
      delegationRoleArn: devAccountServiceRoleArn,
      healthCheckAlarmEmails,
    });

    const webCDN = new WebDistribution(this, 'WebDistribution', {
      hostedZone,
      envDomain,
      certificate,
    });

    const { usersTable } = new Database(this, 'Database');

    const cognito = new Cognito(this, 'Cognito', {
      envDomain,
      authSubdomain,
      localhostPort,
      hostedZone,
      certificate,
      usersTable,
      googleClientId,
      googleClientSecretParamName,
      appleTeamId,
      appleClientId,
      appleKeyId,
      applePrivateKeyParamName,
      authSecretsAssumeRoleArn,
    });

    cognito.node.addDependency(webCDN);

    const stackOutput: StackOutput = {
      userPoolClientId: cognito.userPoolClientId,
      authDomain: cognito.authDomain,
    };

    const cdkOutput: CdkOutput = {
      [stackName]: stackOutput,
    };

    new WebDeployment(this, 'ReactApp', {
      distPath: resolve('frontend/dist'),
      distribution: webCDN.distribution,
      bucket: webCDN.bucket,
      cdkOutput,
    });

    Object.entries(stackOutput).forEach(
      ([key, value]) => new CfnOutput(this, key, { value })
    );
  }
}
