const schema = {
  type: 'object',
  properties: {
    queryStringParameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['OPEN', 'CLOSED', 'open', 'closed'],
          default: 'OPEN',
        },
      },
    },
  },
  required: [
    'queryStringParameters',
  ],
};

export default schema;
