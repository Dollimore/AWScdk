import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";
import type { CfnDistribution } from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";

enum Days {
  Thirty = 30,
  Ninety = 90,
  Yearly = 365,
}

interface WebsiteBucketProps
  extends Omit<
    s3.BucketProps,
    | "websiteIndexDocument"
    | "websiteErrorDocument"
    | "blockPublicAccess"
    | "publicReadAccess"
    | "removalPolicy"
    | "autoDeleteObjects"
  > {
  forceDestroy?: boolean;
}

export class WebsiteBucket extends s3.Bucket {
  static defaultIndexDocument = "index.html";
  static defaultErrorDocument = "index.html";

  constructor(scope: Construct, id: string, props: WebsiteBucketProps) {
    super(scope, id, {
      ...props,
      websiteIndexDocument: WebsiteBucket.defaultIndexDocument,
      websiteErrorDocument: WebsiteBucket.defaultErrorDocument,
      versioned: false,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: props.forceDestroy
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: props.forceDestroy || false,
      lifecycleRules: [
        ...(props.lifecycleRules || []),
        WebsiteBucket.LIFECYCLE_RULE,
      ],
    });
  }

  static get LIFECYCLE_RULE() {
    return {
      abortIncompleteMultipartUploadAfter: cdk.Duration.days(Days.Ninety),
      expiration: cdk.Duration.days(Days.Yearly),
      transitions: [
        {
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(Days.Thirty),
        },
      ],
    };
  }

  errorResponseProperty(
    errorCode: number
  ): CfnDistribution.CustomErrorResponseProperty {
    return {
      errorCode,
      responseCode: 200,
      responsePagePath: `/${WebsiteBucket.defaultErrorDocument}`, // TODO: Extract from initialization props
    };
  }
}
