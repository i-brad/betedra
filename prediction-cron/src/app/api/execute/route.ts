import { ethers } from 'ethers';
import predictionAbi from '@/abi/prediction.json';
import { NextResponse } from 'next/server';

// Contract address on Educhain mainnet
const CONTRACT_ADDRESS = '0xcC38717fc07E0447535afCD66F58b8CEC1a9062C';

// Function to execute a round in the prediction contract
const executeRound = async () => {
  try {
    console.log('Starting executeRound function...');
    
    // Create provider and wallet
    console.log('RPC URL:', process.env.RPC_URL);
    // Use a fallback RPC URL if the environment variable is not set
    const rpcUrl = process.env.RPC_URL || 'https://testnet.hashio.io/api';
    const chainId = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID, 10) : 296;
    
    const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    
    // Add a provider connection check
    try {
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
    } catch (error) {
      console.error('Failed to connect to network:', error);
      throw new Error('Network connection failed. Please check your RPC URL.');
    }
    
    const privateKey = process.env.PRIVATE_KEY as string;
    if (!privateKey || privateKey.trim() === '') {
      throw new Error('Private key is not set in environment variables.');
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('Wallet address:', wallet.address);
    
    // Connect to the prediction contract
    const predictionContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      predictionAbi,
      wallet
    );
    
    // Check if contract is paused
    const isPaused = await predictionContract.paused();
    if (isPaused) {
      console.log('Contract is paused. Skipping execution.');
      return {
        success: false, 
        message: 'Contract is paused'
      };
    }

    // Check if genesis rounds have been started and locked
    const genesisStartOnce = await predictionContract.genesisStartOnce();
    const genesisLockOnce = await predictionContract.genesisLockOnce();
    
    if (!genesisStartOnce || !genesisLockOnce) {
      console.log('Genesis rounds not initiated. Skipping execution.');
      return {
        success: false, 
        message: 'Genesis rounds not initiated',
        genesisStartOnce,
        genesisLockOnce
      };
    }

    // Get current epoch for logging
    const currentEpoch = await predictionContract.currentEpoch();
    console.log(`Current epoch: ${currentEpoch.toString()}`);
    
    // Execute the round
    console.log('Executing round...');
    const tx = await predictionContract.executeRound();
    
    // Wait for transaction to be confirmed
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    return {
      success: true,
      message: 'Round executed successfully',
      currentEpoch: currentEpoch.toString(),
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error: unknown) {
    console.error('Error executing round:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };
  }
};

// Helper function to create a Promise that resolves after the specified time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Define types for execution results
type ExecutionResult = {
  delay: number;
  timestamp: string;
  result?: ReturnType<typeof executeRound> extends Promise<infer T> ? T : never;
  error?: string;
};

// GET handler - will be used by Vercel Cron
export async function GET() {
  try {
    const startTime = new Date();
    console.log(`API route handler invoked at ${startTime.toISOString()}`);
    
    // Initial execution immediately
    console.log('Executing round immediately (0s delay)');
    const initialResult = await executeRound();
    const results: ExecutionResult[] = [{
      delay: 0,
      timestamp: new Date().toISOString(),
      result: initialResult
    }];
    
    // Setup staggered executions with different delays
    const delays = [5000, 10000, 20000, 30000, 40000]; // 5s, 10s, 20s, 30s, 40s
    
    // Due to Vercel's serverless function timeout limitations (typically 10-60s),
    // we need to execute all rounds and collect results before returning
    for (const delay of delays) {
      await wait(delay - (new Date().getTime() - startTime.getTime()));
      
      const currentTime = new Date();
      console.log(`Executing round after ${delay/1000}s delay at ${currentTime.toISOString()}`);
      
      try {
        const result = await executeRound();
        results.push({
          delay: delay/1000,
          timestamp: currentTime.toISOString(),
          result
        });
      } catch (error) {
        console.error(`Error in delayed execution (${delay/1000}s):`, error);
        results.push({
          delay: delay/1000,
          timestamp: currentTime.toISOString(),
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Staggered executions completed',
      executionCount: results.length,
      results
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('API handler error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'execution error',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 200 } // Return 200 since request was successful, but processing failed
    );
  }
}
