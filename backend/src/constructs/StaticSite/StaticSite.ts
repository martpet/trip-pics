import { RemovalPolicy } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

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

    const destinationBucket = new Bucket(this, 'WebBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: { origin: new S3Origin(destinationBucket) },
      domainNames: [hostedZone.zoneName],
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      certificate,
      enableLogging: true,
      logIncludesCookies: true,
    });

    new BucketDeployment(this, 'Deployment', {
      sources: [Source.asset(distPath)],
      destinationBucket,
      distribution,
    });

    new ARecord(this, 'Alias', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
