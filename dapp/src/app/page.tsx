import PrimaryButton from "@/components/shared/Buttons";
import Footer from "@/components/shared/Footer";
import Image from "next/image";

export default function Page() {
  return (
    <div className="pt-[2.9375rem]">
      <header className="mb-[3.3125rem]">
        <Image
          src="/svgs/logo-with-sub-text.svg"
          alt="Betedra Logo"
          width={216}
          height={59}
          className="mx-auto"
        />
      </header>
      <main className="mb-[4.430625rem] min-h-96 p-4">
        <div className="text-center mb-[5.625rem]">
          <h1 className="text-3xl lg:text-5xl font-bold text-blue-gray leading-16">
            PLAY · PREDICT · EARN
          </h1>
          <p className="text-base lg:text-lg max-w-[31.0625rem] mx-auto">
            Join the thrill of on-chain gaming — powered by HBAR. Place your
            bets, test your predictions, and win with provable fairness secured
            on Hedera.
          </p>
        </div>
        <div className="grid md:grid-cols-2 place-items-center max-w-[74.9375rem] mx-auto gap-[1.6875rem]">
          <div className="rounded-2xl text-blue-gray-25 bg-blue-900 border border-blue-gray-300 px-[1.8125rem] py-[2.4375rem] w-full">
            <h3 className="font-bold text-2xl lg:text-[2.5rem]">
              Predict and Win
            </h3>
            <p className="text-base lg:text-lg leading-tight mb-[1.5625rem]">
              Predict prices of tokens as they go up and down
            </p>
            <div className="mb-[6rem]">
              <h4 className="text-base lg:text-lg font-bold mb-1.5">
                How it works
              </h4>
              <ul className="list-inside list-disc text-sm lg:text-base pl-3">
                {[
                  "Connect wallet",
                  "Enter position either UP or DOWN",
                  "Collect your earnings after the round",
                ].map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <PrimaryButton
              text="Start Predicting"
              className="w-[15.125rem]"
              as="link"
              href="/prediction"
            />
          </div>
          <div className="rounded-2xl bg-purple-900 text-blue-gray-25 border border-blue-gray-300 px-[1.8125rem] py-[2.4375rem] w-full">
            <h3 className="font-bold text-2xl lg:text-[2.5rem]">Lottery</h3>
            <p className="text-base lg:text-lg leading-tight mb-[1.5625rem]">
              Participate in each round of lottery tickets drawn.
            </p>
            <div className="mb-[4.5625rem]">
              <h4 className="text-base lg:text-lg font-bold mb-1.5">
                How it works
              </h4>
              <ul className="list-inside list-disc text-sm lg:text-base pl-3">
                {[
                  "Connect wallet",
                  "Buy tickets",
                  "Join lottery round",
                  "Winner gets prize pool",
                ].map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <PrimaryButton
              text="Join lottery round"
              className="w-[15.125rem]"
              as="link"
              href="/lottery"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
