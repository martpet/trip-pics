import { RemovalPolicy } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  Distribution,
  IDistribution,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct, IConstruct } from 'constructs';

interface WebDistributionProps {
  certificate: ICertificate;
  destinationBucket: IBucket;
  hostedZone: IHostedZone;
  isProd: boolean;
}

export class WebDistribution extends Construct {
  public readonly distribution: IDistribution;

  constructor(
    scope: IConstruct,
    id: string,
    { certificate, destinationBucket, hostedZone, isProd }: WebDistributionProps
  ) {
    super(scope, id);

    const distributionLoggingBucket = new Bucket(this, 'DistributionLogging', {
      removalPolicy: RemovalPolicy[isProd ? 'RETAIN' : 'DESTROY'],
      autoDeleteObjects: !isProd,
    });

    this.distribution = new Distribution(this, 'Distribution', {
      domainNames: [hostedZone.zoneName],
      defaultRootObject: 'index.html',
      certificate,
      enableLogging: true,
      logIncludesCookies: true,
      logBucket: distributionLoggingBucket,
      defaultBehavior: {
        origin: new S3Origin(destinationBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
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
    });
  }
}
