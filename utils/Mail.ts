import { Domain } from "./Domain";

export class Mail extends Domain {
  static mailFrom(address: string): string {
    if (address.length === 0) throw new Error("Address cannot be empty");

    return `${address}@${Domain.rootDomain}`;
  }

  static addressFromName(name: string): string {
    if (name.length === 0) throw new Error("Name cannot be empty");

    return `${name.replace(/\s/g, ".")}@${Domain.rootDomain}`;
  }
}
