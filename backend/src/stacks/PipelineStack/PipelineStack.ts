// Deploying with CodePipeline is not recommended.
// Instead, GitHub Workflows works best.
//
// If you really want to deploy with CodePipeline:
// 1. Create a connection in CodeStar to GitHub repo.
// 2. Create a Personal Access Tokens in GitHub with scope "repo:status", and with any expiration date.
// 3. Remove staging.yml and production.yml from GitHub workflows.
// 4. Remove Production and Staging stacks from app.ts.
// 5. In app.ts add:
//
// new PipelineStack(app, 'pipeline', {
//   stackName: `${appName}-Pipeline`,
//   env: {
//     account: '791346621844',
//     region,
//   },
// });
//
// 6. Push changes to "main" (staging env) and "prod" branches.
// 7. Deploy pipeline stack: "npx cdk deploy pipeline --profile aws-profile"

import { App, Stack, StackProps } from 'aws-cdk-lib';

import { AppPipeline, CodeBuildStatusToGit } from '~/constructs';
import { appEnvs, AppEnvWithAWSEnv, appName, gitRepo } from '~/consts';

import packageJson from '../../../../package.json';
import { DeploymentStage } from './DeploymentStage';

const connectionArn =
  'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';

const gitTokenSsmArn =
  'arn:aws:ssm:eu-central-1:791346621844:parameter/codebuild/git-token';

export class PipelineStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const pipelineEnvNames = ['Production', 'Staging'] as const;

    interface PipelineEnv extends AppEnvWithAWSEnv {
      envName: typeof pipelineEnvNames[number];
    }

    const pipelineEnvs = appEnvs.filter(({ envName }) =>
      pipelineEnvNames.includes(envName as PipelineEnv['envName'])
    ) as PipelineEnv[];

    pipelineEnvs.forEach(({ envName, env }) => {
      const gitBranch = {
        Production: 'prod',
        Staging: 'main',
      }[envName];

      const { pipelineName } = new AppPipeline(this, `AppPipeline`, {
        envName,
        env: env!,
        gitBranch,
        DeploymentStage,
        appName,
        nodejs: packageJson.engines.node,
        repo: gitRepo,
        connectionArn,
      });

      new CodeBuildStatusToGit(this, `CodeBuildStatusToGit-${pipelineName}`, {
        pipelineName,
        integrationType: 'GitHub',
        gitTokenSsmArn,
      });
    });
  }
}
