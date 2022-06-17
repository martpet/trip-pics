import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppPipeline, AppPipelineProps } from '~/constructs';

interface PipelineStackProps extends StackProps {
  pipelinesProps: Array<AppPipelineProps>;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    props.pipelinesProps.forEach((pipelineProps) => {
      new AppPipeline(this, `app-pipeline-${pipelineProps.name}`, pipelineProps);
    });
  }
}
