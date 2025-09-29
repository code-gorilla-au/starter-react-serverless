// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: 'application-tracker',
			removal: input?.stage === 'production' ? 'retain' : 'remove',
			protect: ['production'].includes(input?.stage),
			home: 'aws'
		};
	},
	async run() {
		const domain = 'delightable.code-gorilla.com.au';
		const bucket = new sst.aws.Bucket('DelightableAssets');
		const appTable = new sst.aws.Dynamo('delightable-app', {
			fields: {
				pk: 'string',
				sk: 'string'
			},
			primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
			globalIndexes: {
				GSI_INVERSE: {
					hashKey: 'sk',
					rangeKey: 'pk'
				}
			}
		});

		new sst.aws.SvelteKit('DelightableApp', {
			domain: {
				name: domain,
				redirects: ['www.delightable.code-gorilla.com.au']
			},
			environment: {
				VITE_APP_TABLE_NAME: appTable.name,
				VITE_DOMAIN: domain,
				SECRET_APP_SIGNING_TOKEN: process.env.SECRET_APP_SIGNING_TOKEN
			},
			server: {
				architecture: 'arm64',
				runtime: 'nodejs22.x'
			},
			link: [bucket, appTable]
		});
	}
});
