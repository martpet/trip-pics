import { RemovalPolicy } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import path from 'path';

interface WebsiteProps {
  distPath: string;
  domainName: string;
  certificateArn: string;
}

export class Website extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { distPath, domainName, certificateArn }: WebsiteProps
  ) {
    super(scope, id);

    const destinationBucket = new Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const certificate = Certificate.fromCertificateArn(
      this,
      'DomainCert',
      certificateArn
    );

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: { origin: new S3Origin(destinationBucket) },
      domainNames: [domainName],
      certificate,
    });

    new BucketDeployment(this, 'WebsiteDeployment', {
      sources: [Source.asset(path.join(__dirname, distPath))],
      destinationBucket,
      distribution,
    });
  }
}
