export enum PredictionSupportedSymbol {
  HBAR = "HBAR",
}

export type LeaderboardMinRoundsPlatedType<
  T extends PredictionSupportedSymbol
> = {
  [PredictionSupportedSymbol in T]: number;
};
