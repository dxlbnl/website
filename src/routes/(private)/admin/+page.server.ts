import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ cookies }) => {
	const authed = cookies.get('admin_session') === env.ADMIN_TOKEN;
	if (authed) redirect(303, '/admin/feed');
	return { authed: false as const };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const token = (await request.formData()).get('token') as string;
		if (!token || token !== env.ADMIN_TOKEN) {
			return fail(401, { error: 'Invalid token' });
		}
		cookies.set('admin_session', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 365
		});
		redirect(303, '/admin/feed');
	}
};
