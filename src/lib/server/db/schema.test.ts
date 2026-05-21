import { describe, it, expect } from 'vitest'
import { pageviews } from './schema'

// AC1: pageviews table must have exactly the 7 new columns defined in B12.
// We inspect the Drizzle table's column map directly.
describe('pageviews schema — new columns (B12)', () => {
	// The Drizzle table object exposes its columns via the `[Symbol]` map,
	// but columns are also accessible as direct properties on the table object.
	// `pageviews.sessionId` etc. should be Drizzle Column instances if the
	// column is defined; accessing an undefined key returns `undefined`.

	it('has sessionId column', () => {
		expect(pageviews.sessionId).toBeDefined()
	})

	it('has visitorHash column', () => {
		expect(pageviews.visitorHash).toBeDefined()
	})

	it('has country column', () => {
		expect(pageviews.country).toBeDefined()
	})

	it('has city column', () => {
		expect(pageviews.city).toBeDefined()
	})

	it('has deviceType column', () => {
		expect(pageviews.deviceType).toBeDefined()
	})

	it('has os column', () => {
		expect(pageviews.os).toBeDefined()
	})

	it('has browser column', () => {
		expect(pageviews.browser).toBeDefined()
	})

	it('existing columns are still present', () => {
		expect(pageviews.id).toBeDefined()
		expect(pageviews.path).toBeDefined()
		expect(pageviews.referrer).toBeDefined()
		expect(pageviews.visitedAt).toBeDefined()
	})
})
