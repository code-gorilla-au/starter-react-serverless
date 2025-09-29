// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: 'delightable',
            removal: input?.stage === 'production' ? 'retain' : 'remove',
            protect: ['production'].includes(input?.stage),
            home: 'aws'
        };
    },
    async run() {
        const domain = 'delightable.code-gorilla.com.au';
        const bucket = new sst.aws.Bucket('Assets');
        const appTable = new sst.aws.Dynamo('AppTable', {
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

        new sst.aws.SvelteKit('WebApp', {
            domain: {
                name: domain,
            },
            environment: {
                VITE_APP_TABLE_NAME: appTable.name,
                VITE_DOMAIN: domain,
                SECRET_APP_SIGNING_TOKEN: process.env.SECRET_APP_SIGNING_TOKEN ?? ''
            },
            server: {
                runtime: 'nodejs22.x',
                architecture: "x86_64"
            },
            link: [bucket, appTable]
        });
    }
});
