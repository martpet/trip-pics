import { Stack, StackProps } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { AppStage } from '~/app-stage';

const { valueForStringParameter } = StringParameter;

const envs = ['production', 'staging'] as const;

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    envs.forEach((env) => {
      const account = valueForStringParameter(this, `/env/${env}/accountId`);
      const region = valueForStringParameter(this, `/env/${env}/region`);
      const branch = valueForStringParameter(this, `/env/${env}/git-branch`);
      const connectionArn = valueForStringParameter(this, 'githubConnectionArn');
      const githubRepo = 'martpet/trip-pics';

      const synth = new ShellStep('Synth', {
        input: CodePipelineSource.connection(githubRepo, branch, { connectionArn }),
        commands: ['npm ci -f', 'npm run synth'],
      });

      const pipeline = new CodePipeline(this, env, {
        synth,
      });

      const stage = new AppStage(this, `Stage-${env}`, {
        env: { account, region },
      });

      pipeline.addStage(stage);
    });
  }
}
