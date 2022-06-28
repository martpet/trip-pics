import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';
import { Construct } from 'constructs';

interface CodeBuildStatusToGitProps {
  integrationType: 'GitHub' | 'BitBucket';
  gitTokenSsmArn: string;
  pipelineName: string;
}

export class CodeBuildStatusToGit extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { integrationType, gitTokenSsmArn, pipelineName }: CodeBuildStatusToGitProps
  ) {
    super(scope, id);

    new CfnInclude(scope, `${pipelineName}-PipelineStatusGitIntegration`, {
      templateFile: `${__dirname}/codebuild-status-to-git.yml`,
      preserveLogicalIds: false,
      parameters: {
        IntegrationType: integrationType,
        GitTokenSsmArn: gitTokenSsmArn,
        PipelineName: pipelineName,
        EncryptionAtRest: false,
      },
    });
  }
}
