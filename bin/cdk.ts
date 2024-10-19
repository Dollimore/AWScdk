#!/usr/bin/env node
import "source-map-support/register";
// Load environment variables from .env file
import * as dotenv from "dotenv";
dotenv.config();

import * as cdk from "aws-cdk-lib";
import { Domain } from "../src/utils/Domain";
import { WorkplaceStack } from "../lib/WorkplaceStack";
import { EnvironmentConfig } from "../src/utils/EnvironmentConfig";
import { SPAStack } from "../lib/SPAStack";

const app = new cdk.App();

if (!process.env.GOOGLE_DNS_VERIFICATION_TOKEN)
  throw new Error("Missing GOOGLE_DNS_VERIFICATION_TOKEN environment variable"); // TODO: This should be inside the Workplace stack, so it only throws if running that stack without the var, not crashes everything

new WorkplaceStack(app, "WorkplaceStack", {
  domainName: Domain.rootDomain,
  env: EnvironmentConfig.getCountryConfig(),
  verificationToken: process.env.GOOGLE_DNS_VERIFICATION_TOKEN,
});

// Below you can see an exmaple of deploying three whole static website buckets. It important to realise these scripts just deploy
// the infrastructure and then you must deploy your site or manually copy your site into the respective buckets.
// You can make CDK build and deploy the site as well, but running all this infra check and deploy script on each code change is
// overkill. Once the infra is up, code deploy can be run faster alone and just assume the infra is there.
new SPAStack(app, "MainStack", {
  name: "Main",
  description:
    "This could be the primary website example, not using a subdomain",
  rootDomain: Domain.rootDomain,
  domainName: Domain.rootDomain,
  certificateArn: process.env.GLOBAL_CERTIFICATE_ARN,
  env: EnvironmentConfig.getCountryConfig(),
});

new SPAStack(app, "PlayStack", {
  name: "Play",
  description: "Web Gaming Platform Interface",
  rootDomain: Domain.rootDomain,
  domainName: Domain.fromSubdomain("play"),
  certificateArn: process.env.GLOBAL_CERTIFICATE_ARN,
  env: EnvironmentConfig.getCountryConfig(),
});

new SPAStack(app, "OtherStack", {
  name: "Other",
  description: "Antoher example of deploying a second sub domain static site",
  rootDomain: Domain.rootDomain,
  domainName: Domain.fromSubdomain("other"),
  certificateArn: process.env.GLOBAL_CERTIFICATE_ARN,
  env: EnvironmentConfig.getCountryConfig(),
});
