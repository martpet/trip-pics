// Deployment with AWS CodePipeline is not recommended.
// Instead, GitHub Workflows are used.

// If you want to deploy with AWS CodePipeline:

// 1. Remove staging.yml and production.yml from GitHub workflows.
// 2. Remove Production and Staging stacks from app.ts.
// 3. In app.ts add:
//
// new PipelineStack(app, 'pipeline', {
//   stackName: `${appName}-Pipeline`,
//   env: {
//     account: '791346621844',
//     region: appRegion,
//   },
// });
//
// 4. Push changes to "main" (staging env) and "prod" branches.
// 5. Deploy pipeline stack: "npx cdk deploy pipeline --profile aws-profile"

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppPipeline, CodeBuildStatusGitIntegration } from '~/constructs';
import { appEnvs, appName, gitRepo } from '~/consts';
import { EnvName } from '~/types';

import packageJson from '../../../../package.json';
import { DeploymentStage } from './DeploymentStage';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Create a connection in CodeStar to GitHub.
    const connectionArn =
      'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';

    // Create a Personal Access Tokens in GitHub with scope "repo:status" with any expiration date.
    const gitTokenSsmArn =
      'arn:aws:ssm:eu-central-1:791346621844:parameter/codebuild/git-token';

    const pipelineEnvs = Object.entries(appEnvs).filter(([envName]) =>
      ['Production', 'Staging'].includes(envName as EnvName)
    );

    pipelineEnvs.forEach(([envName, { env }]) => {
      const gitBranch = {
        Production: 'prod',
        Staging: 'main',
      }[envName]!;

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

      // Send CodeBuild status to GitHub
      new CodeBuildStatusGitIntegration(this, `CodeBuildStatusToGit-${pipelineName}`, {
        pipelineName,
        integrationType: 'GitHub',
        gitTokenSsmArn,
      });
    });
  }
}
