import { Duration } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  CachePolicy,
  Distribution,
  IDistribution,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct, IConstruct } from 'constructs';

interface WebDistributionProps {
  certificate: ICertificate;
  destinationBucket: IBucket;
  hostedZone: IHostedZone;
}

export class WebDistribution extends Construct {
  public readonly distribution: IDistribution;

  constructor(
    scope: IConstruct,
    id: string,
    { certificate, destinationBucket, hostedZone }: WebDistributionProps
  ) {
    super(scope, id);

    const errorResponses = [
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      },

      // Without s3:ListBucket, CloudFront has no way of returning a 404 response to callers and instead returns HTTP 403 Forbidden.
      // https://github.com/aws/aws-cdk/issues/13983
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      },
    ];

    const cachePolicy = new CachePolicy(this, 'CachePolicy', {
      minTtl: Duration.days(365),
    });

    this.distribution = new Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      domainNames: [hostedZone.zoneName],
      certificate,
      errorResponses,
      enableLogging: true,
      logIncludesCookies: true,
      defaultBehavior: {
        origin: new S3Origin(destinationBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy,
      },
    });
  }
}
