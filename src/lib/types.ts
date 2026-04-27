export type ConsoleFrontmatter = {
	pageType: 'console';
	title: string;
	seoDescription: string;
	tagline: string;
};

export type ProductStatus = 'available' | 'sold-out' | 'coming-soon';

export type ProductFrontmatter = {
	pageType: 'product';
	id: string;
	name: string;
	description: string;
	status: ProductStatus;
	category: string;
	tags: string[];
	tindieUrl?: string;
	stripePriceId?: string;
	image?: string;
	images?: string[];
	price?: number;
	specs?: Record<string, string>;
};

export type FeedFrontmatter = {
	pageType: 'feed';
	date: string;
	tags: string[];
	body: string;
};

export type NoteFrontmatter = {
	pageType: 'note';
	title: string;
	date: string;
	tags: string[];
	kind?: string;
	lede?: string;
	images?: string[];
};

export type MailingFrontmatter = {
	pageType: 'mailing';
	slug: string;
	title: string;
	subject: string;
	date: string;
	published: boolean;
};

export type InvoiceFrontmatter = {
	paginaType: 'factuur';
	factuurnr: string;
	datum: string;
	vervaldatum: string;

	verzender: {
		naam: string;
		gegevens: string[];
		kvk: string;
		btw: string;
		iban: string;
	};

	klant: {
		naam: string;
		adres: string[];
		btw_id?: string;
	};

	regels: Array<{
		omschrijving: string;
		toelichting: string;
		aantal: number;
		tarief: number;
		btw_tarief?: number;
	}>;

	btw_verlegd: boolean;
	valuta?: string;
	taal?: string;
};
