/**
  This stack is not used anymore. Instead, GitHub Workflows is used.
  If you want to deploy with CodePipeline:
 
  1. Create a connection in CodeStar to the GitHub repo.
  2. Add the connection ARN to the variable "connectionArn".
  2. Create a Personal Access Tokens in GitHub with scope "repo:status", and with any expiration date.
  3. Set the access token ARN to the variable 'gitTokenSsmArn'.
  4. Remove staging.yml and production.yml from "backend/.github/workflows".
  5. Remove the current stack in app.ts.
  6. Add in app.ts:

  new PipelineStack(app, stackName, {
    stackName,
    env: {
      account: '791346621844',
      region,
    },
  });

  7. Push to "main" and "prod" branches.
  8. Deploy pipeline stack with: "npx cdk deploy pipeline --profile aws-profile"
*/

import { App, Stack, StackProps } from 'aws-cdk-lib';

import packageJson from '~/../../package.json';
import { AppPipeline, CodeBuildStatusToGit } from '~/constructs';
import { appEnvs, gitRepo, stackName } from '~/consts';
import { EnvName } from '~/types';

import { DeploymentStage } from './DeploymentStage';

const connectionArn =
  'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab';

const gitTokenSsmArn =
  'arn:aws:ssm:eu-central-1:791346621844:parameter/codebuild/git-token';

export class PipelineStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const pipelineEnvs: Array<Exclude<EnvName, 'Personal'>> = ['Production', 'Staging'];

    pipelineEnvs.forEach((envName) => {
      const gitBranch = {
        Production: 'prod',
        Staging: 'main',
      }[envName];

      const { pipelineName } = new AppPipeline(this, `AppPipeline`, {
        envName,
        env: appEnvs[envName].env!,
        gitBranch,
        DeploymentStage,
        stackName,
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
