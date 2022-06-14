import { Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { AppStage } from '~/app-stage';

const region = 'eu-central-1';
const repo = 'martpet/trip-pics';
const connectionArn =
  'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';

const envInfo = {
  production: {
    account: '766373560006',
    branch: 'main',
  },
  staging: {
    account: '204115048155',
    branch: 'staging',
  },
};

const envs = Object.keys(envInfo) as Array<keyof typeof envInfo>;

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    envs.forEach((env) => {
      const { account, branch } = envInfo[env];

      const synthStep = new ShellStep('Synth', {
        input: CodePipelineSource.connection(repo, branch, { connectionArn }),
        commands: ['npm ci -f', 'npm run synth'],
        primaryOutputDirectory: 'backend/cdk.out',
      });

      const pipeline = new CodePipeline(this, `Pipeline-${env}`, {
        pipelineName: env,
        crossAccountKeys: true,
        synth: synthStep,
      });

      const stage = new AppStage(this, env, {
        env: {
          account,
          region,
        },
      });

      pipeline.addStage(stage);
    });
  }
}
