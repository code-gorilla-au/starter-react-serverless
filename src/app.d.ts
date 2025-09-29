// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { ApplicationsService } from '$lib/applications/service.server';
import type { UsersService } from '$lib/users/service.server';
import { AuthService, type UserSession } from '$lib/server/auth';
import type { CampaignService } from '$lib/campaigns/service.server';
import type { CampaignDto } from '$lib/campaigns/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			appsSvc: ApplicationsService;
			campaignSvc: CampaignService;
			userSvc: UsersService;
			authSvc: AuthService;
			session?: UserSession;
			defaultCampaign?: CampaignDto;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
