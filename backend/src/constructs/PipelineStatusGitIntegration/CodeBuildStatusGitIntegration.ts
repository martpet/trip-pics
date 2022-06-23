import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';
import { Construct } from 'constructs';

interface CodeBuildStatusGitIntegrationProps {
  integrationType: 'GitHub' | 'BitBucket';
  gitTokenSsmArn: string;
  pipelineName: string;
}

export class CodeBuildStatusGitIntegration extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { integrationType, gitTokenSsmArn, pipelineName }: CodeBuildStatusGitIntegrationProps
  ) {
    super(scope, id);

    new CfnInclude(scope, `${pipelineName}-PipelineStatusGitIntegration`, {
      templateFile: `${__dirname}/codebuild-to-git-status.yml`,
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
