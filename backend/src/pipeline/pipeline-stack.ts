import { Environment, Stack, StackProps } from 'aws-cdk-lib';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { AppStage } from '~/pipeline';

interface PipelineStackProps extends StackProps {
  pipelines: PipelineProps[];
}

interface PipelineProps {
  name: string;
  branch: string;
  repo: string;
  connectionArn: string;
  env: Environment;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, { pipelines, ...props }: PipelineStackProps) {
    super(scope, id, props);
    pipelines.forEach((pipelineProps) => createPipeline(this, pipelineProps));
  }
}

function createPipeline(scope: Stack, props: PipelineProps) {
  const { name, branch, repo, connectionArn, env } = props;

  const synth = new ShellStep('Synth', {
    input: CodePipelineSource.connection(repo, branch, { connectionArn }),
    commands: ['npm ci -f', 'npm run synth'],
    primaryOutputDirectory: 'backend/cdk.out',
  });

  const partialBuildSpec = BuildSpec.fromObject({
    phases: {
      install: {
        'runtime-versions': {
          nodejs: '14',
        },
      },
    },
  });

  const pipeline = new CodePipeline(scope, `Pipeline-${name}`, {
    synth,
    pipelineName: name,
    crossAccountKeys: true,
    synthCodeBuildDefaults: {
      partialBuildSpec,
    },
  });

  pipeline.addStage(new AppStage(scope, name, { env }));
}
