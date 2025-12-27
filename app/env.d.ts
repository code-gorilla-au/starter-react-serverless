declare namespace NodeJS {
	interface ProcessEnv {
		DOMAIN: string;
		APP_TABLE_NAME: string;
		SECRET_APP_SIGNING_TOKEN: string;
		LOCAL_DYNAMODB_ENDPOINT: string;
	}
}

interface ImportMetaEnv {
	readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
