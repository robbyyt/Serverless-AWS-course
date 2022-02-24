import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import validator from '@middy/validator';
import createAuctionSchema from '../lib/schemas/createAuctionSchema';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
/**
 * Create auction handler
 * @param {*} event - contains info about request params, headers, etc.
 * @param {*} context - metadata about execution of the data function. we can add data using middleware to both
 * @returns
 */
async function createAuction(event, context) {
  const { title } = event.body;
  const { email } = event.requestContext.authorizer;
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    sellerEmail: email,
  };

  try {
      await dynamoDB.put({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction
  }).promise();
  } catch(err) {
    console.error(err);
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ code: 'SUCCESS', data: auction }),
  };
}

export const handler = commonMiddleware(createAuction)
.use(validator({
  inputSchema: createAuctionSchema,
  ajvOptions: {
    useDefaults: true,
    strict: false,
  }
}));

