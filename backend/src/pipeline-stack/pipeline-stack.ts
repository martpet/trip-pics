import { Stack, StackProps } from 'aws-cdk-lib';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { appName, connectionArn, nodejs, sourceRepo } from '~/consts';
import { AppStage } from '~/pipeline-stack/pipeline-stage';
import { PipelineDeploymentProps } from '~/types';

interface PipelineStackProps extends StackProps {
  pipelines: PipelineDeploymentProps[];
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, { pipelines, ...props }: PipelineStackProps) {
    super(scope, id, props);
    pipelines.forEach((options) => createPipeline(this, options));
  }
}

function createPipeline(scope: Stack, props: PipelineDeploymentProps) {
  const { pipelineName, sourceBranch, stageEnv } = props;
  const appStageName = `${appName}-${pipelineName}`;

  const input = CodePipelineSource.connection(sourceRepo, sourceBranch, {
    connectionArn,
  });

  const synth = new ShellStep('Synth', {
    input,
    commands: ['npm ci -f', 'npm run synth'],
    primaryOutputDirectory: 'backend/cdk.out',
  });

  const synthCodeBuildDefaults = {
    partialBuildSpec: BuildSpec.fromObject({
      phases: { install: { 'runtime-versions': { nodejs } } },
    }),
  };

  const pipeline = new CodePipeline(scope, pipelineName, {
    synth,
    synthCodeBuildDefaults,
    crossAccountKeys: true,
    pipelineName,
  });

  pipeline.addStage(
    new AppStage(scope, appStageName, {
      env: stageEnv,
    })
  );
}
