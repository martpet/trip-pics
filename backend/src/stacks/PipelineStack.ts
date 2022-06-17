import { Stack, StackProps } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
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

    const gitUser = 'martpet';

    deployments.forEach((options) => {
      new AppPipeline(this, `app-pipeline-${options.envName}`, {
        ...options,
        repo: `${gitUser}/trip-pics`,
        nodejs: packageJson.engines.node,
        connectionArn:
          'arn:aws:codestar-connections:eu-central-1:791346621844:connection/5d269634-09ef-43bc-9a8f-d7529fb2d4ab',
        buildStatusToGitParams: {
          IntegrationType: 'GitHub',
          IntegrationUser: gitUser,
          IntegrationPass: StringParameter.valueForStringParameter(
            this,
            'GITHUB_REST_STATUS_TOKEN'
          ),
        },
      });
    });
  }
}
