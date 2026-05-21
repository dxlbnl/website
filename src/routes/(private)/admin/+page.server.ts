import { fail, redirect } from '@sveltejs/kit';
import { ADMIN_TOKEN } from '$env/static/private';
import { createAdminSession, verifyAdminSession } from '$lib/utils/auth';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ cookies }) => {
	if (await verifyAdminSession(cookies.get('admin_session'))) redirect(303, '/admin/orders/');
	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const token = (await request.formData()).get('token') as string;
		if (!token || token !== ADMIN_TOKEN) {
			return fail(401, { error: 'Invalid token' });
		}
		cookies.set('admin_session', await createAdminSession(), {
			path: '/admin',
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			maxAge: 60 * 60 * 24 * 365
		});
		redirect(303, '/admin/orders/');
	}
};
