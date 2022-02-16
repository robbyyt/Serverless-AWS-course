import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
/**
 * getAuctions handler
 * @param {*} event - contains info about request params, headers, etc.
 * @param {*} context - metadata about execution of the data function. we can add data using middleware to both
 * @returns
 */
async function getAuctions(event, context) {
  let auctions;

  try {
    const result = await dynamoDB.scan({
      TableName: process.env.AUCTIONS_TABLE_NAME
    }).promise();

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

export const handler = commonMiddleware(getAuctions);

