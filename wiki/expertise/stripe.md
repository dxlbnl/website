# 🎛️ Stripe Configuration & Operations Guide: Eurorack Pre-orders

**Business Type:** Dutch ZZP (Sole Proprietorship)
**Product Category:** Physical Goods (Hardware / Consumer Electronics)
**Model:** Pre-order (Charge immediately, max 2 months delivery)
**Integration:** Stripe Checkout

---

## 1. Business Profile & Compliance

To prevent Stripe from blocking your payouts, ensure your public-facing details and legal pages are strictly configured.

- **Public Details (Stripe Dashboard > Settings > Public details):**
  - **Statement Descriptor:** Make this explicitly clear (e.g., `YOURBRAND PREORDER` or `YOURBRAND SYNTHS`). This is what shows up on the customer's bank app.
  - **Customer Support:** Add your support email and a valid phone number.
- **Website Legal Pages:** Your website footer **must** contain links to:
  - Terms & Conditions (mentioning the 2-month pre-order timeline).
  - Privacy Policy.
  - Shipping Policy (Stating DDU/DAP: "Non-EU buyers are responsible for customs and import duties").
  - Refund Policy (Stating: "Full refund available anytime before shipment").

## 2. Product, Pricing & Multi-Currency

Because you want to charge customers in their local currencies (USD, GBP, etc.) to improve their buying experience, you need to configure multi-currency in Stripe Checkout.

- **Product Tax Code:** Ensure your module is set to `txcd_99999999` (General - Tangible Goods).
- **Pricing Setup:**
  - _Recommended:_ In Stripe Checkout, enable **Adaptive Pricing** (Automatic Currency Conversion). You set the price in EUR (e.g., €250), and Stripe automatically calculates and displays the USD/GBP equivalent to the buyer at checkout based on current exchange rates.
  - _Cost:_ Note that Stripe will charge you a ~1.5% currency conversion fee to convert those local currencies back into EUR for your Dutch bank account.

## 3. Shipping Zones & Rates

Since you are using Option A (Flat Rates by Zone), set this up in the Stripe Dashboard so Checkout can add it automatically:

- **Action:** Go to **Products > Shipping rates** in Stripe and create your zones:
  - **Zone 1 (Netherlands):** e.g., €8
  - **Zone 2 (Europe):** e.g., €15
  - **Zone 3 (Rest of World):** e.g., €30
- In your Checkout code, pass these shipping rate IDs to the `shipping_options` array, and specify the allowed countries in `shipping_address_collection`.
- **Tax on Shipping:** Leave the tax code for shipping as the default "Shipping". Stripe will apply the correct VAT rate to the shipping cost.

## 4. Payment Methods

Go to **Settings > Payment methods** and enable the following based on your target markets:

- **The Netherlands:** iDEAL (Mandatory for NL).
- **Europe:** Bancontact (BE), Giropay (DE), EPS (AT), Przelewy24 (PL).
- **Global:** Credit/Debit Cards, Apple Pay, Google Pay, Link.

## 5. Tax Configuration (Stripe Tax)

Since you are a Dutch ZZP selling physical goods internationally:

- **Origin Address:** Set to your NL KvK address.
- **Registrations to Add in Stripe:**
  1. **The Netherlands:** Enter your Dutch VAT number (Stripe charges 21%).
  2. **European Union (OSS):** Enter your Dutch VAT number under the OSS scheme (Stripe charges local VAT for DE, FR, IT, etc.). _Note: Ensure you are registered for OSS at the Belastingdienst._
- **Non-EU (US, UK, CA, etc.):** Do nothing manually. Stripe Tax will recognize these as Exports and charge **0% VAT**. It will monitor thresholds in the background.
- **B2B Reverse Charge:** Ensure `tax_id_collection` is enabled in your Checkout session so European businesses can enter their VAT ID and get the 21% removed automatically (_btw verlegd_).

## 6. Pre-Order Mechanics & Dispute Management

You are taking the money immediately (Option A) for a product shipping in up to 2 months. This introduces **Chargeback Risk** (customers forgetting they ordered and disputing the charge with their bank).

- **Communication is your shield:**
  - Send an immediate automated receipt confirming it is a "PRE-ORDER" and stating the estimated shipping month.
  - Send at least **one update email** at the 1-month mark (e.g., "Production is going well, expected to ship in 4 weeks!").
- **Refunds:** Since you allow full refunds anytime before shipping, make this very visible. A customer clicking "Email us for a refund" is infinitely better (and cheaper) than a customer opening a bank dispute.

## 7. Bookkeeping (For the ZZP)

Since you don't have accounting software yet, you need a manual process for your quarterly _Btw-aangifte_ (VAT return).

- **Action:** At the end of every quarter (April, July, October, January), go to **Stripe Dashboard > Reports > Balance**.
- Export the **Balance change from activity** report as a CSV.
- Also, go to **Tax > Reports** and export the **Itemized tax report**. This will tell you exactly how much 21% NL VAT you collected, and how much EU OSS VAT you collected, so you can fill in your Belastingdienst forms accurately.
- _Future proofing:_ When you are ready, sign up for a Dutch tool like _Moneybird_ or _e-Boekhouden_. They both have native Stripe integrations that will do this math for you automatically.

---

### Code Checklist for your Stripe Checkout Integration

Make sure your API call includes these parameters:

```javascript
const session = await stripe.checkout.sessions.create({
	mode: 'payment',
	automatic_tax: { enabled: true }, // Turns on tax calculation
	tax_id_collection: { enabled: true }, // For EU B2B sales
	shipping_address_collection: { allowed_countries: ['NL', 'US', 'GB', 'DE' /* ...all 36 */] },
	shipping_options: [
		{ shipping_rate: 'shr_123NLrate' },
		{ shipping_rate: 'shr_456EUrate' },
		{ shipping_rate: 'shr_789Worldrate' }
	]
	// ... line_items and other configurations
});
```
