import { Table } from 'dynamodb-toolbox/table';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { loadServerEnv } from '$lib/server/env';

const config = loadServerEnv();

const dynamoDBClient = new DynamoDBClient({
	endpoint: config.dynamodbEndpoint
});

export const appTable = new Table({
	name: config.appTable,
	partitionKey: { name: 'pk', type: 'string' },
	sortKey: { name: 'sk', type: 'string' },
	indexes: {
		GSI_INVERSE: {
			type: 'global',
			partitionKey: { name: 'sk', type: 'string' },
			sortKey: { name: 'pk', type: 'string' }
		}
	},
	documentClient: DynamoDBDocumentClient.from(dynamoDBClient)
});
