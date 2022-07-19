import { resolve } from 'app-root-path';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Cognito, Db, StaticSite, WebDistribution, Zone } from '~/constructs';
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

    const { hostedZone, certificate } = new Zone(this, 'Zone', {
      envDomain,
      hostedZoneId,
      parentHostedZoneId,
      delegationRoleArn: devAccountServiceRoleArn,
      healthCheckAlarmEmails,
    });

    const webDistribution = new WebDistribution(this, 'WebDistribution', {
      hostedZone,
      envDomain,
      certificate,
    });

    const { usersTable } = new Db(this, 'Db');

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

    cognito.node.addDependency(webDistribution);

    const stackOutput: StackOutput = {
      userPoolClientId: cognito.userPoolClientId,
      authDomain: cognito.authDomain,
    };

    const cdkOutput: CdkOutput = {
      [stackName]: stackOutput,
    };

    new StaticSite(this, 'StaticSite', {
      distPath: resolve('frontend/dist'),
      distribution: webDistribution.distribution,
      bucket: webDistribution.bucket,
      cdkOutput,
    });

    Object.entries(stackOutput).forEach(
      ([key, value]) => new CfnOutput(this, key, { value })
    );
  }
}
