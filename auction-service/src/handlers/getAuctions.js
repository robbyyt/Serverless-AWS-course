import AWS from 'aws-sdk';
import validator from '@middy/validator';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
/**
 * getAuctions handler
 * @param {*} event - contains info about request params, headers, etc.
 * @param {*} context - metadata about execution of the data function. we can add data using middleware to both
 * @returns
 */
async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;

  let auctions;
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status?.toUpperCase(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  try {
    const result = await dynamoDB.query(params).promise();

    auctions = result.Items;

  } catch(err) {
    console.error(err);
    // not advisable, just use this for debugging purposes
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions)
  };
}

export const handler = commonMiddleware(getAuctions).use(
   validator({
    inputSchema: getAuctionsSchema,
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);

