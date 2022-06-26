import { RemovalPolicy } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AaaaRecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import path from 'path';

interface StaticSiteProps {
  distPath: string;
  hostedZone: IHostedZone;
  certificate: ICertificate;
}

export class StaticSite extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { distPath, hostedZone, certificate }: StaticSiteProps
  ) {
    super(scope, id);

    const bucket = new Bucket(this, 'WebBucket', {
      websiteIndexDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: { origin: new S3Origin(bucket) },
      domainNames: [hostedZone.zoneName],
      certificate,
      enableLogging: true,
      logIncludesCookies: true,
    });

    new AaaaRecord(this, 'Alias', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    new BucketDeployment(this, 'Deployment', {
      sources: [Source.asset(path.join(__dirname, distPath))],
      destinationBucket: bucket,
      distribution,
    });
  }
}
