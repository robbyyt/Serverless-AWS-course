import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  let auction;

  try {
    const result = await dynamoDB.get({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id }
     }).promise();

     auction = result.Item;

  } catch(err) {
    console.error(err);
    // not advisable, just use this for debugging purposes
    throw new createError.InternalServerError(err);
  }

  if(!auction) {
    throw new createError.NotFound(`Auction with ID=${id} not found.`);
  }

  return auction;
}
/**
 * getAuction handler
 * @param {*} event - contains info about request params, headers, etc.
 * @param {*} context - metadata about execution of the data function. we can add data using middleware to both
 * @returns
 */
async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction)
  };
}

export const handler = commonMiddleware(getAuction);
