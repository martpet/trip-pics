import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';
import { Construct } from 'constructs';

interface PipelineStatusGitIntegrationProps {
  integrationType: 'GitHub' | 'BitBucket';
  gitTokenSsmArn: string;
  pipelineName: string;
}

export class PipelineStatusGitIntegration extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { integrationType, gitTokenSsmArn, pipelineName }: PipelineStatusGitIntegrationProps
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
