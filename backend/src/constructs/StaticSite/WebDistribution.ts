import { Duration } from 'aws-cdk-lib';
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
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct, IConstruct } from 'constructs';

interface WebDistributionProps {
  bucket: IBucket;
  domainName: string;
  certificate: ICertificate;
  hostedZone: IHostedZone;
}

export class WebDistribution extends Construct {
  readonly distribution: IDistribution;

  constructor(
    scope: IConstruct,
    id: string,
    { bucket, domainName, certificate, hostedZone }: WebDistributionProps
  ) {
    super(scope, id);

    const defaultRootObject = '/index.html';

    // Without s3:ListBucket, CloudFront has no way of returning a 404 response to callers and instead returns HTTP 403 Forbidden.
    // https://github.com/aws/aws-cdk/issues/13983
    const errorResponses = [
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: defaultRootObject,
      },
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: defaultRootObject,
      },
    ];

    const cachePolicy = new CachePolicy(this, 'CachePolicy', {
      minTtl: Duration.days(365),
    });

    const defaultBehavior = {
      origin: new S3Origin(bucket),
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy,
    };

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior,
      defaultRootObject,
      domainNames: [domainName],
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
  }
}
