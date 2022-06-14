import { Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { AppStage } from '~/app-stage';

const connectionArn =
  'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';
const repo = 'martpet/trip-pics';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const synthStep = new ShellStep('Synth', {
      input: CodePipelineSource.connection(repo, 'staging', { connectionArn }),
      commands: ['npm ci -f', 'npm run synth'],
      primaryOutputDirectory: 'backend/cdk.out',
    });

    const pipeline = new CodePipeline(this, `Pipeline-prod`, {
      pipelineName: 'prod',
      synth: synthStep,
    });

    const stage = new AppStage(this, 'prod', {
      env: {
        account: '766373560006',
        region: 'u-central-1',
      },
    });

    pipeline.addStage(stage);
  }
}
