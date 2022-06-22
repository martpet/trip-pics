import { Environment, Stage } from 'aws-cdk-lib';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { PipelineStatusGitIntegration } from '~/constructs';
import { appName } from '~/consts/app';
import { EnvName } from '~/types';

export interface AppPipelineProps {
  envs: Array<{
    envName: EnvName;
    branch: string;
    env: Environment;
  }>;
  repo: string;
  connectionArn: string;
  DeploymentStage: typeof Stage;
  appName: string;
  nodejs?: string;
  primaryOutputDirectory?: string;
  pipelineStatusGitIntegration?: {
    integrationType: 'GitHub' | 'BitBucket';
    gitTokenSsmArn: string;
  };
}

export class AppPipeline extends Construct {
  constructor(
    scope: Construct,
    id: string,
    {
      envs,
      DeploymentStage,
      repo,
      connectionArn,
      nodejs,
      primaryOutputDirectory = 'backend/cdk.out',
      pipelineStatusGitIntegration,
    }: AppPipelineProps
  ) {
    super(scope, id);

    envs.forEach(({ envName, branch, env }) => {
      const synthStep = new ShellStep('Synth', {
        input: CodePipelineSource.connection(repo, branch, { connectionArn }),
        commands: ['npm ci -f', 'npm run synth'],
        primaryOutputDirectory,
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

      const pipeline = new CodePipeline(scope, envName, {
        synth: synthStep,
        pipelineName: envName,
        crossAccountKeys: true,
        selfMutation: false,
        synthCodeBuildDefaults,
      });

      pipeline.addStage(
        new DeploymentStage(scope, `${appName}-${envName}`, {
          env,
          envName,
        } as ConstructorParameters<typeof Stage>[2])
      );

      if (pipelineStatusGitIntegration) {
        new PipelineStatusGitIntegration(this, `CodeBuildStatusToGit-${envName}`, {
          pipelineName: envName,
          ...pipelineStatusGitIntegration,
        });
      }
    });
  }
}
