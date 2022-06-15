import { Stack, StackProps } from 'aws-cdk-lib';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { appName, connectionArn, nodejsVersion, region, sourceRepo } from '~/consts';
import { AppStage } from '~/pipeline-stack/pipeline-stage';

interface PipelineStackProps extends StackProps {
  pipelines: PipelineProps[];
}

interface PipelineProps {
  envName: string;
  sourceBranch: string;
  account: string;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, { pipelines, ...props }: PipelineStackProps) {
    super(scope, id, props);
    pipelines.forEach((pipelineProps) => createPipeline(this, pipelineProps));
  }
}

function createPipeline(scope: Stack, props: PipelineProps) {
  const { envName, sourceBranch, account } = props;
  const capitalizedEnvName = envName.charAt(0).toUpperCase() + envName.slice(1);

  const synthStep = new ShellStep('Synth', {
    input: CodePipelineSource.connection(sourceRepo, sourceBranch, { connectionArn }),
    commands: ['npm ci -f', 'npm run synth'],
    primaryOutputDirectory: 'backend/cdk.out',
  });

  const pipeline = new CodePipeline(scope, capitalizedEnvName, {
    synth: synthStep,
    pipelineName: capitalizedEnvName,
    crossAccountKeys: true,
    synthCodeBuildDefaults: {
      partialBuildSpec: BuildSpec.fromObject({
        phases: {
          install: {
            'runtime-versions': {
              nodejs: nodejsVersion,
            },
          },
        },
      }),
    },
  });

  const appStageId = `${appName}-${capitalizedEnvName}`;

  const appStage = new AppStage(scope, appStageId, {
    env: { account, region },
  });

  pipeline.addStage(appStage);
}
