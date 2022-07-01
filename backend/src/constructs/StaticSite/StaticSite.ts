import { RemovalPolicy } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

import { WebDistribution } from './WebDistribution';

interface StaticSiteProps {
  distPath: string;
  domainName: string;
  certificate: ICertificate;
  hostedZone: IHostedZone;
}

export class StaticSite extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { distPath, hostedZone, domainName, certificate }: StaticSiteProps
  ) {
    super(scope, id);

    const bucket = new Bucket(this, 'WebBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const { distribution } = new WebDistribution(this, 'WebDistribution', {
      bucket,
      hostedZone,
      domainName,
      certificate,
    });

    new BucketDeployment(this, 'WebDeployment', {
      sources: [Source.asset(distPath)],
      destinationBucket: bucket,
      distribution,
    });
  }
}
