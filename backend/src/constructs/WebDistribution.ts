import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  CachePolicy,
  Distribution,
  IDistribution,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct, IConstruct } from 'constructs';

interface WebDistributionProps {
  appDomain: string;
  certificate: ICertificate;
  hostedZone: IHostedZone;
}

export class WebDistribution extends Construct {
  readonly distribution: IDistribution;

  readonly bucket: IBucket;

  constructor(
    scope: IConstruct,
    id: string,
    { appDomain, certificate, hostedZone }: WebDistributionProps
  ) {
    super(scope, id);

    const bucket = new Bucket(this, 'WebBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const defaultBehavior = {
      origin: new S3Origin(bucket),
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: new CachePolicy(this, 'CachePolicy', {
        minTtl: Duration.days(365),
      }),
    };

    const errorResponses = [
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      },
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      },
    ];

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior,
      defaultRootObject: 'index.html',
      domainNames: [appDomain],
      certificate,
      errorResponses,
      enableLogging: true,
      logIncludesCookies: true,
    });

    new ARecord(this, 'Alias', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    this.distribution = distribution;
    this.bucket = bucket;
  }
}
