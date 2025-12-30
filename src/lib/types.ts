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
