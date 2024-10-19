export class Domain {
  static get rootDomain(): string {
    if (!process.env.ROOT_DOMAIN)
      throw new Error("Missing ROOT_DOMAIN environment variable");

    return process.env.ROOT_DOMAIN;
  }

  static fromSubdomain(subdomain: string) {
    return `${subdomain}.${Domain.rootDomain}`;
  }

  static terminate(str: string) {
    return str.endsWith(".") ? str : `${str}.`;
  }
}
