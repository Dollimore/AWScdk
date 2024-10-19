export class EnvironmentConfig {
  static defaultAccount = process.env.AWS_DEFAULT_ACCOUNT;
  static defaultRegion = process.env.AWS_DEFAULT_REGION || "us-east-1";

  static getCountryConfig(countryCode?: string | null) {
    switch (countryCode) {
      case "us":
        return {
          account: EnvironmentConfig.defaultAccount,
          region: "us-east-1",
        };
      case "eu":
        return {
          account: EnvironmentConfig.defaultAccount,
          region: "eu-west-1",
        };
      case "ap":
        return {
          account: EnvironmentConfig.defaultAccount,
          region: "ap-southeast-1",
        };
      default:
        return EnvironmentConfig.defaultConfig;
    }
  }

  static get defaultConfig() {
    return {
      account: EnvironmentConfig.defaultAccount,
      region: EnvironmentConfig.defaultRegion,
    };
  }
}
