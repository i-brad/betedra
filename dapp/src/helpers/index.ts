import { Bet, BetPosition, HistoryFilter, LedgerData } from "@/state/types";
import { BIG_ZERO } from "@/utils/bigNumber";
import { formatBigIntToFixed } from "@/utils/formatBalance";
import getTimePeriods from "@/utils/getTimePeriods";
import {
  PredictionsLedgerResponse,
  PredictionsRoundsResponse,
} from "@/utils/types";
import BN from "bignumber.js";
import { memoize } from "lodash";

const abs = (n: bigint) => (n === -0n || n < 0n ? -n : n);

const calculateMinDisplayed = memoize(
  (decimals: number, displayedDecimals: number): bigint => {
    return 10n ** BigInt(decimals) / 10n ** BigInt(displayedDecimals);
  },
  (decimals, displayedDecimals) => `${decimals}#${displayedDecimals}`
);

type formatPriceDifferenceProps = {
  price?: bigint;
  minPriceDisplayed: bigint;
  unitPrefix: string;
  displayedDecimals: number;
  decimals: number;
};

const formatPriceDifference = ({
  price = 0n,
  minPriceDisplayed,
  unitPrefix,
  displayedDecimals,
  decimals,
}: formatPriceDifferenceProps) => {
  if (abs(price) < minPriceDisplayed) {
    const sign = price < 0n ? -1n : 1n;
    const signedPriceToFormat = minPriceDisplayed * sign;
    return `<${unitPrefix}${formatBigIntToFixed(
      signedPriceToFormat,
      displayedDecimals,
      decimals
    )}`;
  }

  return `${unitPrefix}${formatBigIntToFixed(
    price,
    displayedDecimals,
    decimals
  )}`;
};

export const formatUsdv2 = (usd: bigint, displayedDecimals: number) => {
  return formatPriceDifference({
    price: usd,
    minPriceDisplayed: calculateMinDisplayed(8, displayedDecimals),
    unitPrefix: "$",
    displayedDecimals,
    decimals: 8,
  });
};

export const formatTokenv2 = (
  token: bigint,
  decimals: number,
  displayedDecimals: number
) => {
  return formatPriceDifference({
    price: token,
    minPriceDisplayed: calculateMinDisplayed(decimals, displayedDecimals),
    unitPrefix: "",
    displayedDecimals,
    decimals,
  });
};

export const padTime = (num: number) => num.toString().padStart(2, "0");

export const formatRoundTime = (secondsBetweenBlocks: number) => {
  const { hours, minutes, seconds } = getTimePeriods(secondsBetweenBlocks);
  const minutesSeconds = `${padTime(minutes)}:${padTime(seconds)}`;

  if (hours > 0) {
    return `${padTime(hours)}:${minutesSeconds}`;
  }

  return minutesSeconds;
};

export const makeLedgerData = (
  account: string,
  ledgers: PredictionsLedgerResponse[],
  epochs: number[]
): LedgerData => {
  return ledgers.reduce((accum: any, ledgerResponse, index) => {
    if (!ledgerResponse) {
      return accum;
    }

    // If the amount is zero that means the user did not bet
    if (ledgerResponse.amount === 0n) {
      return accum;
    }

    const epoch = epochs[index].toString();

    return {
      ...accum,
      [account]: {
        ...accum[account],
        [epoch]: serializePredictionsLedgerResponse(ledgerResponse),
      },
    };
  }, {});
};

export const serializePredictionsLedgerResponse = (
  ledgerResponse: PredictionsLedgerResponse
): any => ({
  position:
    Number(ledgerResponse.position) === 0 ? BetPosition.BULL : BetPosition.BEAR,
  amount: ledgerResponse.amount.toString(),
  claimed: ledgerResponse.claimed,
});

export const serializePredictionsRoundsResponse = (
  response: PredictionsRoundsResponse
): any => {
  const {
    epoch,
    startTimestamp,
    lockTimestamp,
    closeTimestamp,
    lockPrice,
    closePrice,
    totalAmount,
    bullAmount,
    bearAmount,
    rewardBaseCalAmount,
    rewardAmount,
    oracleCalled,
    lockOracleId,
    closeOracleId,
  } = response;

  const lockPriceAmount = lockPrice === 0n ? null : lockPrice.toString();
  const closePriceAmount = closePrice === 0n ? null : closePrice.toString();

  return {
    oracleCalled,
    epoch: Number(epoch),
    startTimestamp: startTimestamp === 0n ? null : Number(startTimestamp),
    lockTimestamp: lockTimestamp === 0n ? null : Number(lockTimestamp),
    closeTimestamp: closeTimestamp === 0n ? null : Number(closeTimestamp),
    lockPrice: lockPriceAmount,
    closePrice: closePriceAmount,
    totalAmount: totalAmount.toString(),
    bullAmount: bullAmount.toString(),
    bearAmount: bearAmount.toString(),
    rewardBaseCalAmount: rewardBaseCalAmount.toString(),
    rewardAmount: rewardAmount.toString(),

    // PredictionsV2
    lockOracleId: lockOracleId?.toString(),
    closeOracleId: closeOracleId?.toString(),
  };
};

export const getMultiplierV2 = (total: bigint, amount: bigint) => {
  if (!total) {
    return BIG_ZERO;
  }

  if (total === 0n || amount === 0n) {
    return BIG_ZERO;
  }

  const rewardAmountFixed = new BN(total.toString());
  const multiplierAmountFixed = new BN(amount.toString());

  return rewardAmountFixed.div(multiplierAmountFixed);
};

export const getHasRoundFailed = (
  oracleCalled: boolean,
  closeTimestamp: null | number,
  buffer: number,
  closePrice: null | bigint
) => {
  if (closePrice === 0n) {
    return true;
  }

  if (!oracleCalled || !closeTimestamp) {
    const closeTimestampMs = (Number(closeTimestamp) + buffer) * 1000;

    if (Number.isFinite(closeTimestampMs)) {
      return Date.now() > closeTimestampMs;
    }
  }

  return false;
};

export const getRoundPosition = (
  lockPrice?: bigint | number | null,
  closePrice?: bigint | number | null,
  AIPrice?: bigint | number | null
) => {
  if (!closePrice || !lockPrice) {
    return null;
  }

  // If AI-based prediction
  if (AIPrice) {
    if (
      (Number(closePrice) > Number(lockPrice) &&
        Number(AIPrice) > Number(lockPrice)) ||
      (Number(closePrice) < Number(lockPrice) &&
        Number(AIPrice) < Number(lockPrice)) ||
      (Number(closePrice) === Number(lockPrice) &&
        Number(AIPrice) === Number(lockPrice))
    ) {
      return BetPosition.BULL;
    }

    return BetPosition.BEAR;
  }

  // If not AI-based prediction
  if (Number(closePrice) === Number(lockPrice)) {
    return BetPosition.HOUSE;
  }

  return Number(closePrice) > Number(lockPrice)
    ? BetPosition.BULL
    : BetPosition.BEAR;
};

export const getPriceDifference = (
  price: bigint | null,
  lockPrice: bigint | null
) => {
  if (!price || !lockPrice) {
    return 0n;
  }

  // to be reviewed
  return BigInt(Number(price) - Number(lockPrice));
};

export const getFilteredBets = (bets: Bet[], filter: HistoryFilter) => {
  switch (filter) {
    case HistoryFilter.COLLECTED:
      return bets.filter((bet) => bet.claimed === true);
    case HistoryFilter.UNCOLLECTED:
      return bets.filter((bet) => {
        return (
          !bet.claimed &&
          (bet.position === bet?.round?.position || bet?.round?.failed === true)
        );
      });
    case HistoryFilter.ALL:
    default:
      return bets;
  }
};

export const formatHBAR = (
  bnb: number | undefined,
  displayedDecimals: number
) => {
  return bnb
    ? bnb.toLocaleString(undefined, {
        minimumFractionDigits: displayedDecimals,
        maximumFractionDigits: displayedDecimals,
      })
    : "0";
};
