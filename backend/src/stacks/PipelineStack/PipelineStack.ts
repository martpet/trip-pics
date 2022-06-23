// This stack is not used anymore - deployment is now done with GitHub Workflows.
// If you want to use this stack instead:

// 1. Remove staging.yml and production.yml from GitHub workflows.
// 2. Remove the Production and Staging stacks from app.ts.
// 3. Add in app.ts:
//
// new PipelineStack(app, 'pipeline', {
//   stackName: `${appName}-Pipeline`,
//   env: {
//     account: '791346621844',
//     region: appRegion,
//   },
// });
//
// 4. Push changes to "staging" and "main" branches.
// 5. Deploy pipeline mannualy only once with: "npx cdk deploy pipeline --profile pipelines-aws-profile"

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppPipeline, CodeBuildStatusGitIntegration } from '~/constructs';
import { appName, deployments, gitRepo } from '~/consts';

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

    Object.entries(deployments).forEach(([envName, { env, gitBranch }]) => {
      const { pipelineName } = new AppPipeline(this, `AppPipeline`, {
        envName,
        env,
        gitBranch,
        DeploymentStage,
        appName,
        nodejs: packageJson.engines.node,
        repo: gitRepo,
        connectionArn,
      });

      // Post CodeBuild status to GitHub repo
      new CodeBuildStatusGitIntegration(this, `CodeBuildStatusToGit-${pipelineName}`, {
        pipelineName,
        integrationType: 'GitHub',
        gitTokenSsmArn,
      });
    });
  }
}
