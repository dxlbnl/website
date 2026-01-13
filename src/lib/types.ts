// You could place this in a global type file or utility file.
export type ConsoleFrontmatter = {
	pageType: 'console';
	title: string;
	seoDescription: string;
	tagline: string;
};

export type CatalogueFrontmatter = {
	pageType: 'catalogue';
	title: string;
	seoDescription: string;
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
	tindieUrl: string;
	image?: string;
	price?: number;
	specs?: {
		[key: string]: string;
	};
};

export type InvoiceFrontmatter = {
	paginaType: 'factuur';
	factuurnr: string; // e.g., "2026-0042"
	datum: string; // ISO date
	vervaldatum: string; // ISO date

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
	valuta?: string; // Default: 'EUR'
	taal?: string; // Default: 'nl-NL'
};
