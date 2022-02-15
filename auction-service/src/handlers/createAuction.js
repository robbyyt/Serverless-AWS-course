import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
/**
 * Create auction handler
 * @param {*} event - contains info about request params, headers, etc.
 * @param {*} context - metadata about execution of the data function. we can add data using middleware to both
 * @returns
 */
async function createAuction(event, context) {
  const { title } = JSON.parse(event.body);
  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  await dynamoDB.put({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({ code: 'SUCCESS', data: auction }),
  };
}

export const handler = createAuction;


