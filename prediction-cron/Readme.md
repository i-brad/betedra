## Cron

Performs two major purposes:
- Perfectly time and call `executeRound` every 5 mins on the` BetedraPrediction` Contract for 288 rounds per day.
- Get `updateData` for pyth, runs `pythContract.getUpdateFee` and `pythContract.updatePriceFeeds` every 2 mins to avoid stale Pyth Oracle price feed during prediction to keep the betting fair.