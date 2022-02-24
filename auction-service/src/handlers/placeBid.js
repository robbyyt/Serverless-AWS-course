import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { getAuctionById } from './getAuction';
import placeBidSchema from '../lib/schemas/placeBidSchema';
import validator from '@middy/validator';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
/**
 * getAuction handler
 * @param {*} event - contains info about request params, headers, etc.
 * @param {*} context - metadata about execution of the data function. we can add data using middleware to both
 * @returns
 */
async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const { amount } = event.body;

  const auction = await getAuctionById(id);

  if(auction.sellerEmail === email) {
    throw new createError.Forbidden('You cannot bid on your own item!');
  }

  if(email === auction.highestBid.bidder) {
    throw new createError.Forbidden('You already have the highest bid!');
  }

  if(auction.status !== 'OPEN') {
    throw new createError.Forbidden('Bid must be open!');
  }

  if(amount <= auction?.highestBid?.amount) {
    throw new createError.Forbidden(`Bid must be higher than ${auction?.highestBid?.amount}`);
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email,
    },
    ReturnValues: 'ALL_NEW'
  };

  let updatedAuction;

  try {
    const result = await dynamoDB.update(params).promise();

    updatedAuction = result.Attributes;
  } catch(err) {
    console.error(err);
    // not advisable, just use this for debugging purposes
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction)
  };
}

export const handler = commonMiddleware(placeBid).use(
  validator({
    inputSchema: placeBidSchema,
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);
