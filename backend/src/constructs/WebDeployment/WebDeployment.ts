import { Stack } from 'aws-cdk-lib';
import { IDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

import { StackOutput } from './StackOutput';

interface WebDeploymentProps {
  distPath: string;
  distribution: IDistribution;
  bucket: IBucket;
  stackOutput: StackOutput;
}

export class WebDeployment extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { distPath, distribution, bucket, stackOutput }: WebDeploymentProps
  ) {
    super(scope, id);

    const { stackName } = Stack.of(this);
    const stackOutputFileContent = `window.${stackName} = ${JSON.stringify(stackOutput)}`;

    new BucketDeployment(this, 'WebDeployment', {
      sources: [
        Source.asset(distPath),
        Source.data('stack-output.js', stackOutputFileContent),
      ],
      destinationBucket: bucket,
      distribution,
    });
  }
}
