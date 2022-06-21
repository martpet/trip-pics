import { RemovalPolicy } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

const path = require('path');

interface FrontendWebsiteProps {
  distPath: string;
}

export class FrontendWebsite extends Construct {
  constructor(scope: Construct, id: string, { distPath }: FrontendWebsiteProps) {
    super(scope, id);

    const websiteBucket = new Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset(path.join(__dirname, distPath))],
      destinationBucket: websiteBucket,
    });
  }
}
