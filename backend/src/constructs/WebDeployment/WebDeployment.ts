import { IDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

import { CdkOutput } from './types';

interface WebDeploymentProps {
  distPath: string;
  distribution: IDistribution;
  bucket: IBucket;
  cdkOutput: CdkOutput;
}

export class WebDeployment extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { distPath, distribution, bucket, cdkOutput }: WebDeploymentProps
  ) {
    super(scope, id);

    new BucketDeployment(this, 'WebDeployment', {
      sources: [Source.asset(distPath), Source.jsonData('cdk-output.json', cdkOutput)],
      destinationBucket: bucket,
      distribution,
    });
  }
}
