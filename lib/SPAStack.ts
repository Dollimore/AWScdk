import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cert from "aws-cdk-lib/aws-certificatemanager";
import { WebsiteBucket } from "../src/constructs/SPA/SPABucketConstruct";
import { Domain } from "../src/utils/Domain";
import createResourceId from "../src/utils/ID";

interface SPAStackProps extends cdk.StackProps {
  /**
   * Forms the "description" used on some resources like
   * the CloudFront distribution to help identify the
   * purpose in the AWS Console. Although I chose a horrible
   * property name for it here. It should be `"description"`
   */
  name: string;
  rootDomain: string;
  domainName: string;
  certificateArn: string | undefined;
}

export class SPAStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SPAStackProps) {
    super(scope, id, props);

    // Abort if required props (existing global cert deployment in this case) are not provided
    if (!props.certificateArn)
      throw new Error("GLOBAL_CERTIFICATE_ARN is required");

    // Just a simple pseudo-unique ID builder
    const ID = createResourceId(id);

    // This re-initializes our certificate for use in this deploy script, using the ARN - Amazon Resource Number (Or whatever N stands for)
    // SSL certificate must be in the us-east-1 region, which is "global". This is because cloudfront we use later is multiregion
    const globalCertificate = cert.Certificate.fromCertificateArn(
      this,
      ID("GlobalCertificate"),
      props.certificateArn
    );

    // Pre-emptively setting up the domain we will link at the end
    const hostedZone = route53.HostedZone.fromLookup(this, ID("HostedZone"), {
      domainName: props.rootDomain,
    });

    // The bucket holds the distribution build files of our single page application (react in our case)
    const bucket = new WebsiteBucket(this, ID("ResourceBucket"), {
      bucketName: props.domainName,
      versioned: false,
      forceDestroy: true, // TODO: Only destroy when not production. Props should feed in the environment
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    // This is the security access grants between the bucket holding the resources and the CDN edge service serving them
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      ID("OriginAccessIdentity"),
      {
        comment: "Static Site Access Identity",
      }
    );

    // This is the edge cache service that caches resources and serves them nice and fast. Also serves as a read-only bridge down to the S3 resource bucket
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      ID("PrivateDistribution"),
      {
        comment: props.name,
        defaultRootObject: "index.html", // Usually for React, but other frameworks might have different entry files. React also uses index.html for error pages where Gatsby might use 404.html and such
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
          globalCertificate,
          {
            aliases: [props.domainName],
            sslMethod: cloudfront.SSLMethod.SNI,
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
          }
        ),
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                lambdaFunctionAssociations: [],
              },
            ],
          },
        ],
        errorConfigurations: [
          bucket.errorResponseProperty(404),
          bucket.errorResponseProperty(403),
          bucket.errorResponseProperty(400),
        ],
      }
    );

    // This links the domain name record to our cloudfront edge service
    new route53.ARecord(this, ID("ARecord"), {
      zone: hostedZone,
      recordName: Domain.terminate(props.domainName),
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
    });
  }
}
