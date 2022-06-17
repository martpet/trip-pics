import { Environment } from 'aws-cdk-lib';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { AppPipelineStage } from '~/constructs/AppPipeline/AppPipelineStage';
import { connectionArn, nodejs, sourceRepo } from '~/consts';

export interface AppPipelineProps {
  name: string;
  branch: string;
  env: Environment;
}

export class AppPipeline extends Construct {
  constructor(scope: Construct, id: string, { name, branch, env }: AppPipelineProps) {
    super(scope, id);

    const synthStep = new ShellStep('Synth', {
      input: CodePipelineSource.connection(sourceRepo, branch, { connectionArn }),
      commands: ['npm ci -f', 'npm run synth'],
      primaryOutputDirectory: 'backend/cdk.out',
    });

    const synthCodeBuildDefaults = {
      partialBuildSpec: BuildSpec.fromObject({
        phases: {
          install: {
            'runtime-versions': {
              nodejs,
            },
          },
        },
      }),
    };

    const pipeline = new CodePipeline(scope, name, {
      synth: synthStep,
      pipelineName: name,
      synthCodeBuildDefaults,
      crossAccountKeys: true,
      selfMutation: false,
    });

    const stage = new AppPipelineStage(scope, `Deploy-${name}`, { env });

    pipeline.addStage(stage);
  }
}
