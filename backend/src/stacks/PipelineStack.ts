import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppPipeline, AppPipelineProps } from '~/constructs';

import packageJson from '../../../package.json';

interface PipelineStackProps extends StackProps {
  deployments: Array<Pick<AppPipelineProps, 'envName' | 'branch' | 'env'>>;
}

export class PipelineStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    { deployments, ...props }: PipelineStackProps
  ) {
    super(scope, id, props);

    deployments.forEach((deploymentOptions) => {
      new AppPipeline(this, `app-pipeline-${deploymentOptions.envName}`, {
        ...deploymentOptions,
        repo: 'martpet/trip-pics',
        nodejs: packageJson.engines.node,
        connectionArn:
          'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab',
        pipelineStatusGitIntegration: {
          IntegrationType: 'GitHub',
          GitTokenSsmArn:
            'arn:aws:ssm:eu-central-1:791346621844:parameter/codebuild/git-token',
        },
      });
    });
  }
}
