import { redirect } from '@sveltejs/kit';
import { verifyAdminSession } from '$lib/utils/auth';
import type { LayoutServerLoad } from './$types';

export const prerender = false;

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	if (url.pathname === '/admin' || url.pathname === '/admin/') return {};
	if (!(await verifyAdminSession(cookies.get('admin_session')))) {
		redirect(303, '/admin/');
	}
	return {};
};
