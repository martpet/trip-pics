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
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    props.pipelines.forEach((options) => createPipeline(this, options));
  }
}

function createPipeline(scope: Stack, props: PipelineDeploymentProps) {
  const { pipelineName, sourceBranch, stageEnv } = props;

  const synthStep = new ShellStep('Synth', {
    input: CodePipelineSource.connection(sourceRepo, sourceBranch, {
      connectionArn,
    }),
    commands: ['npm ci -f', 'npm run synth'],
    primaryOutputDirectory: 'backend/cdk.out',
  });

  const pipeline = new CodePipeline(scope, pipelineName, {
    synth: synthStep,
    crossAccountKeys: true,
    pipelineName,
    synthCodeBuildDefaults: {
      partialBuildSpec: BuildSpec.fromObject({
        phases: { install: { 'runtime-versions': { nodejs } } },
      }),
    },
  });

  pipeline.addStage(
    new AppStage(scope, `${appName}-${pipelineName}`, {
      env: stageEnv,
    })
  );
}
