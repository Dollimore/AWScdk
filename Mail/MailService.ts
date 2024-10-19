import { Construct } from "constructs";
import { CfnOutput } from "aws-cdk-lib";
import * as ses from "aws-cdk-lib/aws-ses";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as iam from "aws-cdk-lib/aws-iam";
import { Mail } from "../utils/Mail";

export interface MailServiceProps {
  hostedZone: route53.IHostedZone;
  domainName: string;
  account: string;
  region: string;
}

export class MailService extends Construct {
  protected account: string;
  protected region: string;
  readonly addresses: string[] = [];

  constructor(scope: Construct, id: string, props: MailServiceProps) {
    super(scope, id);

    this.account = props.account;
    this.region = props.region;

    this.createDNSRecords(props);

    // Grant SES Send Email permissions to an IAM Role (Optional)
    const sesSendRole = new iam.Role(this, "SesSendRole", {
      assumedBy: new iam.ServicePrincipal("ses.amazonaws.com"),
    });

    sesSendRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: [
          `arn:aws:ses:${props.region}:${props.account}:identity/${props.domainName}`,
        ],
      })
    );
  }

  protected createDNSRecords(props: MailServiceProps) {
    throw new Error("Method not implemented.");
  }

  public identityFromEmailAddress(emailAddress: string): ses.EmailIdentity {
    const identity = new ses.EmailIdentity(
      this,
      `SesEmailIdentity${emailAddress}`,
      {
        identity: ses.Identity.email(Mail.mailFrom(emailAddress)),
      }
    );

    this.addresses.push(identity.emailIdentityName);

    new CfnOutput(this, "SesEmailVerificationStatus", {
      value: `A verification email has been sent to ${emailAddress}. Check the S3 bucket to retrieve and verify.`,
    });

    return identity;
  }
}
