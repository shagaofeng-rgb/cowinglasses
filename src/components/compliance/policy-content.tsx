import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { businessDetails } from "@/config/business";
import { shippingRules } from "@/data/fixtures/shipping-rules";

export type PolicyType = "shipping" | "returns" | "warranty" | "privacy" | "terms";

function BusinessIdentity() {
  return <p><strong>Merchant:</strong> {businessDetails.legalName}<br/><strong>Registered address:</strong> {businessDetails.registeredAddress}<br/><strong>Contact:</strong> <a href={`mailto:${businessDetails.supportEmail}`}>{businessDetails.supportEmail}</a></p>;
}

export function PolicyContent({ locale, type }: { locale: Locale; type: PolicyType }) {
  const path = (value: string) => `/${locale}${value}`;
  const effective = <p className="text-sm">Effective date: {businessDetails.effectiveDate}</p>;

  if (type === "shipping") return <>
    {effective}
    <h2>Order processing and dispatch</h2>
    <p>Orders are processed for dispatch within 3 business days after a completed order is accepted. Delivery is provided by available international carriers. Delivery times are estimates and begin after dispatch.</p>
    <h2>Shipping charges and estimated transit time</h2>
    <div className="not-prose overflow-x-auto"><table className="w-full min-w-[540px] border-collapse text-left text-sm"><thead><tr className="border-b border-[var(--line)]"><th className="py-3 pr-4">Destination</th><th className="py-3 pr-4">Shipping charge</th><th className="py-3">Estimated transit time</th></tr></thead><tbody>{shippingRules.filter((rule) => !rule.excluded).map((rule) => <tr className="border-b border-[var(--line)]" key={rule.region}><td className="py-3 pr-4 font-semibold">{rule.region}</td><td className="py-3 pr-4">USD {rule.usdFee.toFixed(2)}</td><td className="py-3">{rule.estimatedDays}</td></tr>)}</tbody></table></div>
    <p>Shipping charges are shown in USD. We do not currently advertise a free-shipping promotion. We are unable to ship to Brazil. Import duties, taxes, customs clearance charges and other destination-country fees are the customer&apos;s responsibility unless local law requires otherwise.</p>
    <h2>Delivery delays</h2>
    <p>Carrier capacity, customs inspections, weather, public holidays, pandemics and other events outside our reasonable control may delay delivery. We will use reasonable efforts to assist with delivery enquiries, but cannot guarantee a carrier&apos;s delivery date.</p>
    <h2>Contact</h2>
    <BusinessIdentity/>
  </>;

  if (type === "returns") return <>
    {effective}
    <h2>30-day return window</h2>
    <p>You may request a return or exchange within 30 days of delivery. To start a request, email <a href={`mailto:${businessDetails.supportEmail}`}>{businessDetails.supportEmail}</a> with your order number, product model and the reason for the request. Please wait for return instructions before sending an item.</p>
    <h2>Return condition</h2>
    <p>Returned items should include the original product, accessories and packaging, and be in a condition suitable for inspection. We may assess a return that is incomplete, damaged after delivery, altered, or missing accessories before a refund or exchange is approved.</p>
    <h2>Refund timing and return postage</h2>
    <p>Once an authorised return is received and inspected, we will notify you of the outcome. Any approved refund is issued to the original payment method after the payment provider completes its processing. Return-postage responsibility for non-quality international returns will be confirmed in the return authorisation before the item is sent.</p>
    <h2>Faulty, damaged or incorrect items</h2>
    <p>If an item arrives damaged, faulty or incorrect, contact us promptly with your order number and available photos or video. This helps us assess the issue and provide the appropriate next step.</p>
    <BusinessIdentity/>
  </>;

  if (type === "warranty") return <>
    {effective}
    <h2>Limited warranty</h2>
    <p>Eligible CoWin Glasses products include a 6-month limited warranty from delivery. The warranty covers verified manufacturing defects under normal intended use.</p>
    <h2>What is not covered</h2>
    <p>The warranty generally does not cover accidental damage, liquid damage, unauthorised repair or modification, normal wear, misuse, loss, theft, or damage caused by use outside product instructions.</p>
    <h2>How to make a claim</h2>
    <p>Contact <a href={`mailto:${businessDetails.supportEmail}`}>{businessDetails.supportEmail}</a> with the order number, product model, issue description and available photo or video. We may request additional information to assess the claim.</p>
    <BusinessIdentity/>
  </>;

  if (type === "privacy") return <>
    {effective}
    <h2>Who is responsible for this website</h2>
    <BusinessIdentity/>
    <h2>Information we collect</h2>
    <p>We collect information you provide through customer-support and warranty forms, including contact details, order references and your message. When an enabled checkout is introduced, payment-card information will be handled by the selected payment provider and will not be stored by this website.</p>
    <h2>How we use information</h2>
    <p>We use information to respond to support requests, assess warranty claims, provide order-related assistance, protect the site and meet applicable legal obligations. We do not sell personal information.</p>
    <h2>App and product data</h2>
    <p>CoWin app, camera and translation data practices depend on the final production technology and will be published before those services are made available. We will update this policy when those data flows are confirmed.</p>
    <h2>Your questions</h2>
    <p>For privacy questions or requests, contact <a href={`mailto:${businessDetails.supportEmail}`}>{businessDetails.supportEmail}</a>.</p>
  </>;

  return <>
    {effective}
    <h2>Merchant information</h2>
    <BusinessIdentity/>
    <h2>Orders, prices and payment</h2>
    <p>Product prices are shown in USD. Local-currency figures are estimates only; the final payment is charged in USD. A purchase contract is formed only when an order is accepted through an enabled checkout. Where checkout is not enabled, no payment information is collected or approved.</p>
    <h2>Shipping, returns and warranty</h2>
    <p>Shipping, returns and warranty information forms part of these Terms. Please review our <Link href={path("/support/shipping-delivery")}>Shipping &amp; Delivery</Link>, <Link href={path("/support/returns-refunds")}>Returns &amp; Refunds</Link> and <Link href={path("/support/warranty")}>Warranty &amp; Support</Link> pages before ordering.</p>
    <h2>GOVERNING LAW</h2>
    <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of UK.</p>
    <h2>INTELLECTUAL PROPERTY RIGHTS</h2>
    <p>The CoWin name, website design, content, product images, trademarks and other intellectual property displayed on this website belong to, or are used with permission by, their respective owners. You may not copy, reproduce, modify, distribute or use them without prior written permission.</p>
    <object data="https://www.9-bill.com/index/legal" aria-label="Intellectual property rights notice" className="mt-4 block h-20 w-full rounded-lg border border-[var(--line)] bg-white">
      <p>Unable to display the intellectual property notice. <a href="https://www.9-bill.com/index/legal" target="_blank" rel="noreferrer">Open the notice in a new tab</a>.</p>
    </object>
    <p className="mt-3 text-sm">If the embedded notice is unavailable, <a className="font-bold underline underline-offset-4" href="https://www.9-bill.com/index/legal" target="_blank" rel="noreferrer">open the intellectual property notice in a new tab</a>.</p>
  </>;
}
