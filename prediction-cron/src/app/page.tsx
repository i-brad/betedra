import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-3xl items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          SailFish Prediction Cron Job
        </h1>
        
        <div className="bg-white/30 p-8 rounded-lg shadow-lg">
          <p className="mb-4">
            This service automatically executes the <code className="font-mono bg-gray-100 p-1 rounded">executeRound</code> function on the SailFish Prediction contract every 20 seconds using Vercel&apos;s cron job functionality.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-3">Service Status</h2>
          <p className="mb-2">
            The cron job is active and running on Vercel every minute, with staggered executions:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Immediate execution when the cron job starts</li>
            <li>Then additional executions after:</li>
            <ul className="list-circle pl-6 mb-2 space-y-1">
              <li>5 seconds</li>
              <li>10 seconds</li>
              <li>20 seconds</li>
              <li>30 seconds</li>
              <li>40 seconds</li>
            </ul>
          </ul>
          <p className="text-xs text-gray-600 mb-2">
            Each minute interval triggers 6 contract executions with carefully timed spacing.
          </p>
          
          <h2 className="text-2xl font-semibold mb-3">Test API Endpoint</h2>
          <p className="mb-2">
            You can manually trigger the execution by visiting:
          </p>
          <Link 
            href="/api/execute" 
            className="text-blue-600 hover:text-blue-800 block mb-6"
          >
            /api/execute
          </Link>
          
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <h3 className="font-bold">Note:</h3>
            <p>
              This page is simply an interface. The actual cron functionality runs server-side
              according to the schedule defined in the Vercel configuration.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500">
          <p>Contract Address: 0x649a201Fe58a369fA45cFD3adbE20bCB855262c9</p>
          <p>Network: Educhain Mainnet</p>
        </div>
      </div>
    </main>
  );
}
