// Type declarations for OpenSearch modules to satisfy TypeScript validation
declare module '@opensearch-project/opensearch' {
  export class Client {
    constructor(config: any);
    index(params: any): Promise<any>;
    delete(params: any): Promise<any>;
    indices: {
      exists(params: any): Promise<any>;
      create(params: any): Promise<any>;
    };
  }
}

declare module '@opensearch-project/opensearch/aws' {
  export function AwsSigv4Signer(config: any): any;
}

declare module '@aws-sdk/credential-provider-node' {
  export function defaultProvider(): any;
}
