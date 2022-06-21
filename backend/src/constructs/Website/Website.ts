import { RemovalPolicy } from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

const path = require('path');

interface WebsiteProps {
  distPath: string;
}

export class Website extends Construct {
  constructor(scope: Construct, id: string, { distPath }: WebsiteProps) {
    super(scope, id);

    const destinationBucket = new Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: { origin: new S3Origin(destinationBucket) },
    });

    new BucketDeployment(this, 'WebsiteDeployment', {
      sources: [Source.asset(path.join(__dirname, distPath))],
      destinationBucket,
      distribution,
    });
  }
}
