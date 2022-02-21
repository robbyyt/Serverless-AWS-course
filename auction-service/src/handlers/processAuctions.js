import createError from 'http-errors';
import { closeAuction } from '../lib/closeAuction';
import { getEndedAuctions } from '../lib/getEndedAuctions';

async function processAuctions(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closedAuctions = await Promise.all(auctionsToClose.map(auction => closeAuction(auction)));

    return {
      closed: closedAuctions.length
    };

  } catch(err) {
    console.error(err);
    // not advisable, just use this for debugging purposes
    throw new createError.InternalServerError(err);
  }
}

export const handler = processAuctions;
