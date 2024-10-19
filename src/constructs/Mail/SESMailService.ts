import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ses from "aws-cdk-lib/aws-ses";
import * as sesActions from "aws-cdk-lib/aws-ses-actions";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import { MailService, MailServiceProps } from "./MailService";
import { Mail } from "../../utils/Mail";

// ! I don't use this construct anymore, but another example of extending a base construct (MailService)

export class SesMailService extends MailService {
  constructor(scope: Construct, id: string, props: MailServiceProps) {
    super(scope, id, props);

    this.createVerificationReceiptBucket(this.rootEmailAddress);
  }

  get rootEmailAddress(): string {
    return Mail.mailFrom("admin");
  }

  protected createDNSRecords(
    hostedZone: route53.IHostedZone,
    domainName: string
  ) {
    const sesDomainIdentity = new ses.EmailIdentity(this, "SesIdentity", {
      identity: ses.Identity.domain(domainName),
    });

    new route53.MxRecord(this, "SesMXRecord", {
      zone: hostedZone,
      recordName: domainName,
      values: [
        {
          priority: 10,
          hostName: `inbound-smtp.${this.region}.amazonaws.com`,
        },
      ],
    });

    new route53.TxtRecord(this, "SesSPFRecord", {
      zone: hostedZone,
      recordName: domainName,
      values: ["v=spf1 include:amazonses.com ~all"],
    });

    sesDomainIdentity.dkimRecords.forEach((record, index) => {
      new route53.CnameRecord(this, `SesDKIMRecord${index}`, {
        zone: hostedZone,
        recordName: record.name,
        domainName: record.value,
      });
    });

    new route53.TxtRecord(this, "DmarcRecord", {
      zone: hostedZone,
      recordName: `_dmarc.${domainName}`,
      values: [`v=DMARC1; p=none; rua=mailto:${this.rootEmailAddress}`],
    });
  }

  private createVerificationReceiptBucket(emailAddress: string) {
    // S3 Bucket
    const bucket = new s3.Bucket(this, "ResourceBucket", {
      bucketName: "ses-verification-emails",
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });
    // Grant permissions to SES to write emails to the S3 bucket
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("ses.amazonaws.com")],
        actions: ["s3:PutObject"],
        resources: [`${bucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            "aws:Referer": this.account,
          },
        },
      })
    );
    // Create SES receipt rule set
    const ruleSet = new ses.ReceiptRuleSet(this, "SesReceiptRuleSet", {
      receiptRuleSetName: "default-rule-set",
    });
    // Create a receipt rule to store emails in the S3 bucket
    new ses.ReceiptRule(this, "SesS3ReceiptStorage", {
      ruleSet: ruleSet,
      recipients: [emailAddress],
      actions: [
        new sesActions.S3({
          bucket: bucket,
          objectKeyPrefix: "verification-emails/",
        }),
      ],
      enabled: true,
    });
  }
}
