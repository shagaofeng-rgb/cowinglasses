"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  FileText,
  LoaderCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  getShippingDestinationCountryCode,
  quoteShipping,
  shippingCnyPerUsd,
  shippingDestinations,
} from "@/config/shipping";
import { useCart } from "@/providers/cart-provider";
import type { Product } from "@/types/product";
import type { ShippingDestinationId, ShippingQuote } from "@/types/commerce";
import {
  getStorefrontSessionId,
  trackStorefrontEvent,
} from "@/components/analytics/storefront-tracker";
import { PaymentMethods } from "@/components/compliance/payment-methods";
import {
  OceanpaymentEmbed,
  type OceanpaymentSession,
} from "@/components/commerce/oceanpayment-embed";
import { checkoutCopy } from "./checkout-copy";
import { localize } from "@/lib/i18n";
import { messages } from "@/messages";
import styles from "@/components/layout/storefront-design.module.css";

type CheckoutItem = {
  product: Product;
  sku: Product["colors"][number];
  quantity: number;
};
type SubmitState =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; orderNumber: string };

export function OrderCheckout({
  locale,
  products,
}: {
  locale: Locale;
  products: Product[];
}) {
  const t = checkoutCopy[locale];
  const searchParams = useSearchParams();
  const { lines, clear } = useCart();
  const [destinationId, setDestinationId] = useState<
    ShippingDestinationId | ""
  >("");
  const [payment, setPayment] = useState<"card" | "transfer">("card");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ type: "idle" });
  const [paymentSession, setPaymentSession] =
    useState<OceanpaymentSession | null>(null);
  const [paymentEnvironment, setPaymentEnvironment] = useState<
    "test" | "production"
  >("test");
  const paymentReturn = searchParams.get("payment_return");
  const directProduct = products.find(
    (item) => item.slug === searchParams.get("product"),
  );
  const directSku =
    directProduct?.colors.find(
      (color) => color.id === searchParams.get("color"),
    ) ?? directProduct?.colors[0];
  const items = useMemo<CheckoutItem[]>(() => {
    if (directProduct && directSku)
      return [{ product: directProduct, sku: directSku, quantity: 1 }];
    return lines.flatMap((line) => {
      const product = products.find((item) => item.id === line.productId);
      const sku = product?.colors.find(
        (color) => color.id === line.skuId || color.skuId === line.skuId,
      );
      return product && sku ? [{ product, sku, quantity: line.quantity }] : [];
    });
  }, [directProduct, directSku, lines, products]);
  const subtotal = items.reduce(
    (total, item) => total + item.product.usdPrice * item.quantity,
    0,
  );
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const shippingQuote = useMemo(
    () => (destinationId ? quoteShipping(destinationId, totalQuantity) : null),
    [destinationId, totalQuantity],
  );
  const shippingUnavailable = shippingQuote?.status === "unavailable";
  const orderTotal =
    subtotal +
    (shippingQuote?.status === "quoted" ? shippingQuote.totalUsd : 0);

  useEffect(() => {
    if (items.length)
      trackStorefrontEvent("begin_checkout", {
        itemCount: items.length,
        subtotal,
      });
  }, [items.length, subtotal]);

  async function submitOrder(formData: FormData) {
    if (!items.length || !shippingQuote || shippingUnavailable) return;
    const accountPassword = String(formData.get("accountPassword") ?? "");
    if (accountPassword !== String(formData.get("confirmPassword") ?? "")) {
      setSubmitState({ type: "error", message: t.passwordMismatch });
      return;
    }
    setSubmitting(true);
    setSubmitState({ type: "idle" });
    try {
      const response = await fetch("/api/storefront/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((item) => ({
            skuId: item.sku.skuId ?? item.sku.id,
            quantity: item.quantity,
          })),
          customer: {
            email: String(formData.get("email") ?? ""),
            firstName: String(formData.get("firstName") ?? ""),
            lastName: String(formData.get("lastName") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            acceptsMarketing: formData.get("marketing") === "on",
          },
          accountPassword,
          shippingAddress: {
            country: shippingQuote.destinationLabel,
            address: String(formData.get("address") ?? ""),
            city: String(formData.get("city") ?? ""),
            province: String(formData.get("province") ?? ""),
            postalCode: String(formData.get("postalCode") ?? ""),
          },
          shippingDestinationId: shippingQuote.destinationId,
          shippingMethod: "quote",
          paymentPreference: payment,
          returnUrl: window.location.href,
          couponCode: String(formData.get("couponCode") ?? ""),
          analyticsSessionId: getStorefrontSessionId(),
          note: String(formData.get("note") ?? ""),
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        data?: {
          orderNumber: string;
          payment?: OceanpaymentSession;
          paymentEnvironment?: "test" | "production";
        };
        error?: { code?: string };
      };
      if (!response.ok || !result.success || !result.data) {
        const errors: Record<string, string> = {
          ACCOUNT_PASSWORD_INVALID: t.accountInvalid,
          ACCOUNT_LOCKED: t.accountLocked,
          SHIPPING_UNAVAILABLE: t.shippingUnavailable,
          PAYMENT_UNAVAILABLE: t.paymentUnavailable,
        };
        throw new Error(errors[result.error?.code ?? ""] ?? t.orderError);
      }
      trackStorefrontEvent("order_created", {
        orderNumber: result.data.orderNumber,
        itemCount: items.length,
        subtotal: orderTotal,
      });
      if (payment === "card" && result.data.payment) {
        setPaymentSession(result.data.payment);
        setPaymentEnvironment(result.data.paymentEnvironment ?? "test");
        return;
      }
      if (!directProduct) clear();
      setSubmitState({ type: "success", orderNumber: result.data.orderNumber });
    } catch (error) {
      setSubmitState({
        type: "error",
        message: error instanceof Error ? error.message : t.orderError,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length)
    return (
      <div className={styles.checkoutPage}>
        <section className={styles.statusPage}>
          <div>
            {paymentReturn ? (
              <>
                <CheckCircle2 className="mx-auto text-[#7c9400]" size={46} />
                <p className="eyebrow mt-5">{t.returnReceived}</p>
                <h1 className="mt-3 text-4xl font-black tracking-[-.06em]">
                  {t.confirming}
                </h1>
                <p className="mt-4 max-w-xl text-[var(--muted)]">
                  {t.returnCopy}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-black tracking-[-.06em]">
                  {t.empty}
                </h1>
                <p className="mt-4 text-[var(--muted)]">{t.emptyCopy}</p>
              </>
            )}
            <Link className="button-primary mt-7" href={`/${locale}/shop`}>
              {t.browse}
            </Link>
          </div>
        </section>
      </div>
    );
  if (submitState.type === "success")
    return (
      <div className={styles.checkoutPage}>
        <section className={styles.statusPage}>
          <div>
            <CheckCircle2 className="mx-auto text-[#7c9400]" size={46} />
            <p className="eyebrow mt-5">{t.orderReceived}</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.06em]">
              {t.thankYou}
            </h1>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              <strong>{submitState.orderNumber}</strong>. {t.orderCopy}
            </p>
            <Link className="button-primary mt-7" href={`/${locale}/shop`}>
              {t.continueShopping}
            </Link>
          </div>
        </section>
      </div>
    );

  return (
    <div className={`${styles.checkoutPage} ${styles.formSurface}`}>
      <form action={submitOrder}>
        <section className={`shell ${styles.checkoutLayout}`}>
          <div className={styles.checkoutFlow}>
            <h1 className={styles.checkoutTitle}>
              {t.title}
            </h1>
            {paymentReturn && (
              <p
                role="status"
                className="mt-4 rounded-xl bg-[#f7fbe9] p-4 text-sm leading-6 text-[#455216]"
              >
                {t.returnCopy}
              </p>
            )}
            <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
              {t.intro}
            </p>
            <section className="mt-10">
              <h2 className="text-2xl font-black tracking-[-.04em]">{t.contact}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field
                  label={t.email}
                  name="email"
                  type="email"
                  full
                  required
                />
                <Field label={t.firstName} name="firstName" required />
                <Field label={t.lastName} name="lastName" required />
                <Field label={t.phone} name="phone" full required />
                <label className="flex items-center gap-3 text-sm sm:col-span-2">
                  <input
                    name="marketing"
                    type="checkbox"
                    className="h-4 w-4 accent-[#6b7e0d]"
                  />
                  {t.marketing}
                </label>
              </div>
            </section>
            <section className={styles.checkoutHighlight}>
              <h2 className="text-2xl font-black tracking-[-.04em]">{t.account}</h2>
              <p className="mt-2 text-sm leading-6 text-[#455216]">{t.accountCopy}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label={t.password} name="accountPassword" type="password" required minLength={10} autoComplete="current-password" />
                <Field label={t.confirmPassword} name="confirmPassword" type="password" required minLength={10} autoComplete="current-password" />
              </div>
            </section>
            <section className="mt-10">
              <h2 className="text-2xl font-black tracking-[-.04em]">
                {t.delivery}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DestinationSelect
                  locale={locale}
                  label={t.country}
                  placeholder={t.chooseCountry}
                  value={destinationId}
                  onChange={setDestinationId}
                />
                <Field label={t.address} name="address" full required />
                <Field label={t.city} name="city" required />
                <Field label={t.province} name="province" />
                <Field label={t.postal} name="postalCode" />
              </div>
              <ShippingEstimate quote={shippingQuote} locale={locale} />
            </section>
            <section className="mt-10">
              <h2 className="text-2xl font-black tracking-[-.04em]">
                {t.shippingMethod}
              </h2>
              <div className="mt-4">
                <Option
                  checked
                  title={t.shippingMethodTitle}
                  description={t.shippingMethodCopy}
                  price={
                    shippingQuote?.status === "quoted"
                      ? `USD ${formatUsd(shippingQuote.totalUsd)}`
                      : t.chooseDestination
                  }
                  icon={<Truck size={20} />}
                />
              </div>
            </section>
            <section className="mt-10">
              <h2 className="text-2xl font-black tracking-[-.04em]">{t.coupon}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {t.couponCopy}
              </p>
              <Field label={t.couponCode} name="couponCode" full />
            </section>
            <section className="mt-10">
              <h2 className="text-2xl font-black tracking-[-.04em]">
                {t.payment}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {t.paymentCopy}
              </p>
              <div className="mt-4 grid gap-3">
                <Option
                  checked={payment === "card"}
                  onChange={() => setPayment("card")}
                  title={t.card}
                  description={t.cardCopy}
                  price={t.secure}
                  icon={<CreditCard size={20} />}
                />
                <Option
                  checked={payment === "transfer"}
                  onChange={() => setPayment("transfer")}
                  title={t.transfer}
                  description={t.transferCopy}
                  price={t.invoice}
                  icon={<FileText size={20} />}
                />
              </div>
              <PaymentMethods />
              {paymentSession && (
                <OceanpaymentEmbed
                  session={paymentSession}
                  production={paymentEnvironment === "production"}
                />
              )}
            </section>
            <section className="mt-10">
              <h2 className="text-2xl font-black tracking-[-.04em]">
                {t.notes}
              </h2>
              <textarea
                name="note"
                className="mt-4 min-h-32 w-full rounded-2xl border border-[var(--line)] bg-white p-4 outline-none ring-[var(--lime)] focus:ring-2"
                placeholder={t.notesPlaceholder}
              />
            </section>
            <section className="mt-10 border-t border-[var(--line)] pt-8">
              <h2 className="text-2xl font-black tracking-[-.04em]">
                {t.policies}
              </h2>
              <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[var(--muted)]">
                <input
                  name="termsAccepted"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-[#6b7e0d]"
                />
                <span>
                  {t.policyConsent}{" "}
                  <Link
                    className="font-bold underline underline-offset-4"
                    href={`/${locale}/policies/terms`}
                  >
                    {messages[locale].footer.terms}
                  </Link>
                  ,{" "}
                  <Link
                    className="font-bold underline underline-offset-4"
                    href={`/${locale}/policies/privacy`}
                  >
                    {messages[locale].footer.privacy}
                  </Link>
                  ,{" "}
                  <Link
                    className="font-bold underline underline-offset-4"
                    href={`/${locale}/support/shipping-delivery`}
                  >
                    {messages[locale].footer.shipping}
                  </Link>{" "}
                  and{" "}
                  <Link
                    className="font-bold underline underline-offset-4"
                    href={`/${locale}/support/returns-refunds`}
                  >
                    {messages[locale].footer.returns}
                  </Link>
                  .
                </span>
              </label>
              <object
                type="text/x-scriptlet"
                data="https://www.9-bill.com/index/cart"
                width="100%"
                height="50"
                aria-label="Checkout terms notice"
                className="mt-5 block h-12 rounded-lg border border-[var(--line)] bg-white"
              >
                <p>
                  Checkout notice unavailable.{" "}
                  <a
                    href="https://www.9-bill.com/index/cart"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open the checkout notice
                  </a>
                  .
                </p>
              </object>
              <a
                className="mt-3 inline-block text-sm font-bold underline underline-offset-4"
                href="https://www.9-bill.com/index/cart"
                target="_blank"
                rel="noreferrer"
              >
                {t.openNotice}
              </a>
            </section>
          </div>
          <aside className={`${styles.checkoutSummary} h-fit p-6 lg:sticky lg:top-24`}>
            <p className="text-xs font-bold uppercase tracking-wide text-[#6b7e0d]">
              {t.summary}
            </p>
            <div className="mt-5 grid gap-4">
              {items.map((item) => (
                <div
                  className="flex gap-4"
                  key={`${item.product.id}-${item.sku.id}`}
                >
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#eff2ee]">
                    <Image
                      src={item.sku.images[0] ?? item.product.heroImage}
                      alt={localize(item.product.name, locale)}
                      width={160}
                      height={160}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-black">{localize(item.product.name, locale)}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {localize(item.sku.name, locale)} · {item.quantity} {item.quantity === 1 ? t.unit : t.units}
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      USD {formatUsd(item.product.usdPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex justify-between border-b border-[var(--line)] py-5 text-sm">
              <span>{t.shipping}</span>
              <strong>
                {shippingQuote?.status === "quoted"
                  ? `USD ${formatUsd(shippingQuote.totalUsd)}`
                  : t.chooseDestination}
              </strong>
            </div>
            <div className="flex justify-between py-5 text-lg font-black">
              <span>{t.estimatedTotal}</span>
              <span>USD {formatUsd(orderTotal)}</span>
            </div>
            {submitState.type === "error" && (
              <p
                role="alert"
                className="mb-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800"
              >
                {submitState.message}
              </p>
            )}
            <button
              type="submit"
              disabled={
                submitting ||
                !shippingQuote ||
                shippingUnavailable ||
                Boolean(paymentSession)
              }
              className="button-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle className="animate-spin" size={18} />
              )}{" "}
              {submitting
                ? t.creating
                : paymentSession
                  ? t.ready
                  : payment === "card"
                    ? t.continuePayment
                    : t.submit}
            </button>
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              {t.estimateNote}
            </p>
            <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-5 text-sm">
              <p className="flex gap-2">
                <Truck size={17} className="shrink-0" />
                {t.matched}
              </p>
              <p className="flex gap-2">
                <ShieldCheck size={17} className="shrink-0" />
                {t.provider}
              </p>
              <p className="flex gap-2">
                <CheckCircle2 size={17} className="shrink-0" />
                {t.volume}
              </p>
            </div>
          </aside>
        </section>
      </form>
    </div>
  );
}

function formatUsd(value: number) {
  return value.toFixed(2);
}

function Field({
  label,
  name,
  type = "text",
  full = false,
  required = false,
  minLength,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  full?: boolean;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  return (
    <label className={full ? "grid gap-2 sm:col-span-2" : "grid gap-2"}>
      <span className="text-sm font-bold">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 outline-none ring-[var(--lime)] focus:ring-2"
      />
    </label>
  );
}

function DestinationSelect({
  locale,
  label,
  placeholder,
  value,
  onChange,
}: {
  locale: Locale;
  label: string;
  placeholder: string;
  value: ShippingDestinationId | "";
  onChange: (id: ShippingDestinationId | "") => void;
}) {
  return (
    <label className="grid gap-2 sm:col-span-2">
      <span className="text-sm font-bold">{label}</span>
      <select
        name="shippingDestinationId"
        value={value}
        required
        onChange={(event) =>
          onChange(event.target.value as ShippingDestinationId | "")
        }
        className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 outline-none ring-[var(--lime)] focus:ring-2"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {shippingDestinations.map((destination) => (
          <option
            key={destination.id}
            value={destination.id}
            disabled={destination.status === "unavailable"}
          >
            {localizedDestinationLabel(destination.id, destination.label, locale)}
          </option>
        ))}
      </select>
    </label>
  );
}

function localizedDestinationLabel(id: string, fallback: string, locale: Locale) {
  const countryCode = getShippingDestinationCountryCode(id);
  const country = new Intl.DisplayNames([locale], { type: "region" }).of(countryCode) ?? fallback;
  if (id === "malaysia_west") return `${country} — West Malaysia`;
  if (id === "malaysia_east") return `${country} — East Malaysia`;
  if (id === "brazil") return `${country} — unavailable`;
  return country;
}

function ShippingEstimate({ quote, locale }: { quote: ShippingQuote | null; locale: Locale }) {
  const t = checkoutCopy[locale];
  if (!quote)
    return (
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {t.chooseDestinationCopy}
      </p>
    );
  if (quote.status === "unavailable")
    return (
      <p
        role="alert"
        className="mt-4 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800"
      >
        {quote.note}
      </p>
    );
  const isFlatUsdRate =
    quote.handlingAdjustmentCny === 0 &&
    quote.carrierFeeCny === 0 &&
    !quote.volumetricDivisor;
  return (
    <aside
      className="mt-4 rounded-2xl border border-[#c7d887] bg-[#f7fbe9] p-5"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#657800]">
            {t.estimatedShipping}
          </p>
          <p className="mt-1 font-black">{quote.destinationLabel}</p>
        </div>
        <strong className="text-2xl tracking-[-.04em]">
          USD {formatUsd(quote.totalUsd)}
        </strong>
      </div>
      <div className="mt-4 grid gap-1 text-sm leading-6 text-[#455216]">
        {isFlatUsdRate ? (
          <>
            <p>{t.flatRate}</p>
          </>
        ) : (
          <>
            <p>
              {t.basedOn} {quote.itemCount} {quote.itemCount === 1 ? t.pair : t.pairs} · {t.actualWeight} {quote.actualWeightKg.toFixed(1)} kg · {t.billedWeight} {quote.chargeableWeightKg.toFixed(1)} kg.
            </p>
            <p>
              {t.includes} ¥{quote.handlingAdjustmentCny} {t.handling}
              {quote.carrierFeeCny
                ? ` + ¥${quote.carrierFeeCny} ${t.carrier}`
                : ""}
              .
            </p>
            <p>
              {t.converted} ¥{quote.totalCny.toFixed(2)} · ¥{shippingCnyPerUsd.toFixed(2)} = USD 1.00.
            </p>
            <p>
              {quote.volumetricDivisor
                ? ` ${t.dimension} (L × W × H ÷ ${quote.volumetricDivisor})`
                : ""}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}

function Option({
  checked = true,
  onChange,
  title,
  description,
  price,
  icon,
}: {
  checked?: boolean;
  onChange?: () => void;
  title: string;
  description: string;
  price: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:border-[var(--ink)]">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        readOnly={!onChange}
        className="mt-1 h-4 w-4 accent-[#6b7e0d]"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-black">
            {icon}
            {title}
          </span>
          <strong className="text-sm">{price}</strong>
        </span>
        <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
          {description}
        </span>
      </span>
    </label>
  );
}
