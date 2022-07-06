import { Environment, Stage } from 'aws-cdk-lib';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

export interface AppPipelineProps {
  gitBranch: string;
  envName: string;
  env: Environment;
  repo: string;
  connectionArn: string;
  DeploymentStage: typeof Stage;
  stackName: string;
  nodejs?: string;
  primaryOutputDirectory?: string;
}

export class AppPipeline extends Construct {
  readonly pipelineName: string;

  constructor(
    scope: Construct,
    id: string,
    {
      gitBranch,
      envName,
      env,
      DeploymentStage,
      stackName,
      repo,
      connectionArn,
      nodejs,
      primaryOutputDirectory = 'backend/cdk.out',
    }: AppPipelineProps
  ) {
    super(scope, id);

    const synthStep = new ShellStep('Synth', {
      input: CodePipelineSource.connection(repo, gitBranch, { connectionArn }),
      commands: ['npm ci -f', 'npm run synth'],
      primaryOutputDirectory,
    });

    const synthCodeBuildDefaults = {
      partialBuildSpec: BuildSpec.fromObject({
        phases: {
          install: {
            'runtime-versions': { nodejs },
          },
        },
      }),
    };

    const codePipeline = new CodePipeline(scope, envName, {
      synth: synthStep,
      pipelineName: envName,
      crossAccountKeys: true,
      selfMutation: false,
      synthCodeBuildDefaults,
    });

    this.pipelineName = codePipeline.pipeline.pipelineName;

    codePipeline.addStage(
      new DeploymentStage(scope, `${stackName}-${envName}`, {
        env,
        envName,
      } as ConstructorParameters<typeof Stage>[2])
    );
  }
}
