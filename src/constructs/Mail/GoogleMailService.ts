import * as route53 from "aws-cdk-lib/aws-route53";
import { MailService, MailServiceProps } from "./MailService";
import { Construct } from "constructs";

interface GoogleMailServiceProps extends MailServiceProps {
  /**
   * Google Domain Verification Token
   */
  verificationToken: string;
}

export class GoogleMailService extends MailService {
  constructor(scope: Construct, id: string, props: GoogleMailServiceProps) {
    super(scope, id, props);
  }

  protected createDNSRecords(props: GoogleMailServiceProps) {
    new route53.MxRecord(this, "GoogleMxRecord", {
      zone: props.hostedZone,
      recordName: props.domainName,
      values: [
        {
          priority: 1,
          hostName: "SMTP.GOOGLE.COM.",
        },
      ],
    });

    new route53.TxtRecord(this, "GoogleTxtRecord", {
      zone: props.hostedZone,
      recordName: props.domainName,
      values: [`google-site-verification=${props.verificationToken}`],
    });

    new route53.CnameRecord(this, "GoogleCnameRecord", {
      zone: props.hostedZone,
      recordName: "xqtrnkjtyusr", // ! Replace with yours or pull from props
      domainName: "gv-s4d5e87mzotrno.dv.googlehosted.com", // ! Replace with yours or pull from props
    });
  }
}
