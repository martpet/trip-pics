import { Environment } from 'aws-cdk-lib';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { DeployStage } from '~/constructs';

export interface AppPipelineProps {
  envName: string;
  env: Environment;
  branch: string;
  repo: string;
  nodejs: string;
  connectionArn: string;
  pipelineStatusGitIntegration?: {
    IntegrationType: 'GitHub' | 'BitBucket';
    GitTokenSsmArn: string;
  };
}

export class AppPipeline extends Construct {
  constructor(
    scope: Construct,
    id: string,
    {
      envName,
      branch,
      repo,
      env,
      nodejs,
      pipelineStatusGitIntegration,
      connectionArn,
    }: AppPipelineProps
  ) {
    super(scope, id);

    const synthStep = new ShellStep('Synth', {
      input: CodePipelineSource.connection(repo, branch, { connectionArn }),
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

    const pipelineName = envName;

    const codePipeline = new CodePipeline(scope, envName, {
      synth: synthStep,
      pipelineName,
      synthCodeBuildDefaults,
      crossAccountKeys: true,
      selfMutation: false,
    });

    codePipeline.addStage(new DeployStage(scope, `Deploy-${envName}`, { env }));

    if (pipelineStatusGitIntegration) {
      // Temp solution, until CDK v2 is supported:
      // https://www.npmjs.com/package/@neweracode/cdk-codepipeline-github
      new CfnInclude(scope, `${envName}-PipelineStatusGitIntegration`, {
        templateFile: `${__dirname}/pipeline-status-git-integration.yml`,
        preserveLogicalIds: false,
        parameters: {
          ...pipelineStatusGitIntegration,
          PipelineName: pipelineName,
          EncryptionAtRest: false,
        },
      });
    }
  }
}
