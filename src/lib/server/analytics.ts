export function parseDeviceType(ua: string | null): 'mobile' | 'tablet' | 'desktop' | null {
	if (ua === null) return null
	if (/tablet|ipad/i.test(ua)) return 'tablet'
	if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile'
	return 'desktop'
}

export function parseOs(
	ua: string | null
): 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Other' | null {
	if (ua === null) return null
	if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
	if (/android/i.test(ua)) return 'Android'
	if (/windows/i.test(ua)) return 'Windows'
	if (/macintosh|mac os x/i.test(ua)) return 'macOS'
	if (/linux/i.test(ua)) return 'Linux'
	return 'Other'
}

export function parseBrowser(
	ua: string | null
): 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Other' | null {
	if (ua === null) return null
	if (/edg\//i.test(ua)) return 'Edge'
	if (/firefox\//i.test(ua)) return 'Firefox'
	if (/chrome\//i.test(ua)) return 'Chrome'
	if (/safari\//i.test(ua)) return 'Safari'
	return 'Other'
}

export async function computeVisitorHash(
	ip: string,
	ua: string,
	date: string,
	salt: string
): Promise<string> {
	const data = new TextEncoder().encode(ip + ua + date + salt)
	const hashBuffer = await crypto.subtle.digest('SHA-256', data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
