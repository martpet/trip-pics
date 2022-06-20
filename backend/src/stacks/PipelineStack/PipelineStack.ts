// This stack is not used. Instead, deployment is done with GitHub Workflows.
//
// If you prefer to deploy with the PipelineStack, do this once:
// 1. Remove staging.yml and production.yml GitHub workflows.
// 2. Add the follwing to /app.ts:
//
// new PipelineStack(app, 'pipeline', {
//   stackName: `${appName}-Pipeline`,
//   env: {
//     account: '791346621844',
//     region: appRegion,
//   },
// });
//
// 3. Commit changes and push to "develop" and "main" branches.
// 4. Run from /backend folder: "npx cdk deploy pipeline --profile trip-pics-pipelines"

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppPipeline } from '~/constructs';
import { appName, appRegion } from '~/consts';

import packageJson from '../../../../package.json';
import { DeploymentStage } from './DeploymentStage';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new AppPipeline(this, `AppPipeline`, {
      envs: [
        {
          envName: 'Production',
          branch: 'main',
          env: {
            account: '766373560006',
            region: appRegion,
          },
        },
        {
          envName: 'Staging',
          branch: 'develop',
          env: {
            account: '204115048155',
            region: appRegion,
          },
        },
      ],
      repo: 'martpet/trip-pics',
      DeploymentStage,
      appName,
      connectionArn:
        'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab',
      nodejs: packageJson.engines.node,
      pipelineStatusGitIntegration: {
        integrationType: 'GitHub',
        gitTokenSsmArn:
          // Create a GitHub Personal access tokens with "repo:status" scope. Set an expiration date or it won't work.
          'arn:aws:ssm:eu-central-1:791346621844:parameter/codebuild/git-token',
      },
    });
  }
}
