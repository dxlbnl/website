import { COUNTRIES_EU, COUNTRIES_WORLD } from '$env/static/private';
import type Stripe from 'stripe';

type AllowedCountry = Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;

export const EU_COUNTRIES = COUNTRIES_EU.split(',') as AllowedCountry[];
export const WORLD_COUNTRIES = COUNTRIES_WORLD.split(',') as AllowedCountry[];
export const ALL_COUNTRIES = [...EU_COUNTRIES, ...WORLD_COUNTRIES];

export function getRegion(country: string): 'NL' | 'EU' | 'World' | null {
	if (country === 'NL') return 'NL';
	if (EU_COUNTRIES.includes(country as AllowedCountry)) return 'EU';
	if (WORLD_COUNTRIES.includes(country as AllowedCountry)) return 'World';
	return null;
}
