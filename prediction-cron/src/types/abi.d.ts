// Type declaration for JSON imports
declare module '@/abi/*.json' {
  const value: Array<{
    inputs?: Array<{ name: string; type: string; indexed?: boolean; internalType?: string }>;
    outputs?: Array<{ name: string; type: string; internalType?: string }>;
    name?: string;
    type: string;
    stateMutability?: string;
    anonymous?: boolean;
  }>;
  export default value;
}
