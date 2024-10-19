import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import { GoogleMailService } from "../src/constructs/GoogleMailService";

interface WorkplaceStackProps extends cdk.StackProps {
  domainName: string;
  verificationToken: string;
}

/**
 * Deploys workplace tools and services. In this instance
 * it configures the Route53 Domain service to direct mail
 * traffice to a Google Workspace mail server for Google
 * workmail.
 */
export class WorkplaceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WorkplaceStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    });

    new GoogleMailService(this, "GoogleMailService", {
      hostedZone,
      domainName: props.domainName,
      account: this.account,
      region: this.region,
      verificationToken: props.verificationToken,
    });
  }
}
