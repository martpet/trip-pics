import { Environment, Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { AppStage } from '~/app-stage';

interface PipelineStackProps extends StackProps {
  pipelines: PipelineProps[];
}

interface PipelineProps {
  name: string;
  branch: string;
  env: Environment;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, { pipelines, ...props }: PipelineStackProps) {
    super(scope, id, props);
    pipelines.forEach((pipelineProps) => createPipeline(this, pipelineProps));
  }
}

function createPipeline(stack: Stack, { name, env, branch }: PipelineProps) {
  const connectionArn =
    'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';

  const synth = new ShellStep('Synth', {
    input: CodePipelineSource.connection('martpet/trip-pics', branch, { connectionArn }),
    commands: ['npm ci -f', 'npm run synth'],
    primaryOutputDirectory: 'backend/cdk.out',
  });

  const pipeline = new CodePipeline(stack, `Pipeline-${name}`, {
    synth,
    pipelineName: name,
    crossAccountKeys: true,
  });

  const stage = new AppStage(stack, name, { env });

  pipeline.addStage(stage);
}
