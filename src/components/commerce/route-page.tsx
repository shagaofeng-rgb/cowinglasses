"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { products as fixtureProducts } from "@/data/fixtures/products";
import { ProductCard } from "@/components/product/product-card";
import { CartPage } from "./cart-page";
import { OrderCheckout } from "./order-checkout";
import { PaymentVerification } from "./payment-verification";
import { DemoForm } from "@/components/forms/demo-form";
import { localize } from "@/lib/i18n";
import { Price } from "./price";
import type { Product } from "@/types/product";
import {
  PolicyContent,
  type PolicyType,
} from "@/components/compliance/policy-content";
import { AccountPage } from "./account-page";
import styles from "@/components/layout/storefront-design.module.css";

type RoutePageProps = {
  locale: Locale;
  segments: string[];
  products?: Product[];
};
export function RoutePage({
  locale,
  segments,
  products = fixtureProducts,
}: RoutePageProps) {
  const path = segments.join("/");
  if (path === "shop") return <Shop locale={locale} products={products} />;
  if (path.startsWith("collections/"))
    return (
      <Collection locale={locale} slug={segments[1]} products={products} />
    );
  if (path === "cart") return <CartPage locale={locale} products={products} />;
  if (path === "checkout")
    return <OrderCheckout locale={locale} products={products} />;
  if (path === "payment-test") return <PaymentVerification locale={locale} />;
  if (path === "compare")
    return <Compare locale={locale} products={products} />;
  if (path === "search")
    return <SearchPage locale={locale} products={products} />;
  if (path === "how-it-works") return <HowItWorks locale={locale} />;
  if (path === "app") return <AppPage locale={locale} />;
  if (path === "lens-guide") return <LensGuide />;
  if (path === "account") return <AccountPage locale={locale} />;
  if (path === "support" || path === "support/faq")
    return <Support locale={locale} faq={path.endsWith("faq")} />;
  if (path === "support/contact") return <SupportContact locale={locale} />;
  if (path === "support/shipping-delivery") return <Policy locale={locale} type="shipping" />;
  if (path === "support/returns-refunds") return <Policy locale={locale} type="returns" />;
  if (path === "support/warranty") return <Policy locale={locale} type="warranty" />;
  if (path === "policies/privacy")
    return <Policy locale={locale} type="privacy" />;
  if (path === "policies/terms") return <Policy locale={locale} type="terms" />;
  if (path === "policies/intellectual-property")
    return <Policy locale={locale} type="intellectual-property" />;
  return <NotFound locale={locale} />;
}

function PageHead({
  eyebrow,
  title,
  intro,
  variant = "default",
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  variant?: "default" | "learn";
}) {
  return (
    <header className={`${styles.pageHero} ${variant === "learn" ? styles.pageHeroLearn : ""}`}>
      <div className={`shell ${styles.pageHeroShell}`}>
        <div className={styles.pageHeroCopy}>
          <h1 className={styles.pageHeroTitle}>{title}</h1>
          <p className={styles.pageHeroIntro}>{intro}</p>
        </div>
        <p className={styles.pageHeroIndex}>{eyebrow || "CoWin Glasses"}</p>
      </div>
    </header>
  );
}
function Shop({ locale, products }: { locale: Locale; products: Product[] }) {
  const t = messages[locale];
  const [query, setQuery] = useState("");
  const [feature, setFeature] = useState("all");
  const [sort, setSort] = useState("featured");
  const shown = useMemo(
    () =>
      products
        .filter((product) => !product.demo)
        .filter(
          (product) =>
            `${localize(product.name, locale)} ${localize(product.description, locale)}`
              .toLowerCase()
              .includes(query.toLowerCase()) &&
            (feature === "all" || product.features.includes(feature as never)),
        )
        .sort((a, b) =>
          sort === "low"
            ? a.usdPrice - b.usdPrice
            : sort === "high"
              ? b.usdPrice - a.usdPrice
              : 0,
        ),
    [products, query, feature, sort, locale],
  );
  return (
    <div className={styles.page}>
      <PageHead
        eyebrow={t.nav.shop}
        title={t.shop.title}
        intro={t.shop.intro}
      />
      <section className={`shell ${styles.sectionTight}`}>
        <div className={styles.catalogControls}>
          <label>
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="w-full bg-transparent outline-none"
            />
          </label>
          <select
            aria-label={t.shop.feature}
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            className="min-h-11 px-3"
          >
            <option value="all">{t.shop.filters}</option>
            <option value="translation">AI real-time translation</option>
            <option value="open-ear-audio">Open-ear audio</option>
            <option value="camera-photography">Camera photography</option>
            <option value="prescription-ready">Prescription-ready</option>
            <option value="sunglasses">Sunglasses</option>
          </select>
          <select
            aria-label={t.shop.sort}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="min-h-11 px-3"
          >
            <option value="featured">{t.shop.newest}</option>
            <option value="low">{t.shop.lowHigh}</option>
            <option value="high">{t.shop.highLow}</option>
          </select>
        </div>
        {shown.length ? (
          <div className={styles.catalogGrid}>
            {shown.map((product) => (
              <ProductCard product={product} locale={locale} key={product.id} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div>
            <SlidersHorizontal className="mx-auto" />
            <p className="mt-4 text-[var(--muted)]">{t.common.noResults}</p>
            <button
              className="button-secondary mt-4"
              onClick={() => {
                setQuery("");
                setFeature("all");
              }}
            >
              {t.common.clear}
            </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
function Collection({
  locale,
  slug,
  products,
}: {
  locale: Locale;
  slug?: string;
  products: Product[];
}) {
  const collection = slug || "explore";
  const title = collection
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
  const subset = products.filter((product) =>
    product.collections.includes(collection as never),
  );
  return (
    <div className={styles.page}>
      <PageHead
        eyebrow="Collection"
        title={title}
        intro="Browse models currently published in the CoWin catalogue."
      />
      <section className={`shell ${styles.section} ${styles.catalogGrid}`}>
        {subset.length ? (
          subset.map((product) => (
            <ProductCard product={product} locale={locale} key={product.id} />
          ))
        ) : (
          <p className="text-[var(--muted)]">
            No published products are currently assigned to this collection.
          </p>
        )}
      </section>
    </div>
  );
}
function Compare({
  locale,
  products,
}: {
  locale: Locale;
  products: Product[];
}) {
  const [ids, setIds] = useState(
    products.slice(0, 3).map((product) => product.id),
  );
  const selected = products.filter((product) => ids.includes(product.id));
  return (
    <div className={styles.page}>
      <PageHead
        eyebrow="Compare"
        title="See the shape of your choice."
        intro="Compare up to three currently published models."
      />
      <section className={`shell ${styles.section}`}>
        <div className={styles.comparePicker}>
          {products.map((product) => (
            <label
              className={styles.compareOption}
              key={product.id}
            >
              <input
                type="checkbox"
                checked={ids.includes(product.id)}
                onChange={() =>
                  setIds((current) =>
                    current.includes(product.id)
                      ? current.filter((id) => id !== product.id)
                      : current.length < 3
                        ? [...current, product.id]
                        : current,
                  )
                }
              />
              {localize(product.name, locale)}
            </label>
          ))}
        </div>
        <div className={styles.compareTable}>
          <table className="text-start text-sm">
            <thead>
              <tr>
                <th className="p-5">Model</th>
                {selected.map((product) => (
                  <th className="p-5" key={product.id}>
                    {localize(product.name, locale)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Local price",
                  (p: Product) => (
                    <Price usd={p.usdPrice} locale={locale} compact />
                  ),
                ],
                ["Features", (p: Product) => p.features.join(", ")],
                ["Lens", (p: Product) => p.lensType],
                [
                  "Camera",
                  (p: Product) =>
                    p.camera ? "Configured fields" : "Not represented",
                ],
                [
                  "Battery",
                  (p: Product) => p.camera?.battery || "To be confirmed",
                ],
              ].map(([label, value]) => (
                <tr
                  className="border-t border-[var(--line)]"
                  key={label as string}
                >
                  <th className="p-5 text-[var(--muted)]">{label as string}</th>
                  {selected.map((product) => (
                    <td className="p-5 align-top" key={product.id}>
                      {(value as (p: Product) => React.ReactNode)(product)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
function HowItWorks({ locale }: { locale: Locale }) {
  return (
    <div className={styles.page}>
      <PageHead
        eyebrow="How it works"
        title="Wear it. Pair it. Keep your phone close."
        intro="CoWin glasses connect to your phone over Bluetooth. Selected translation functions need the app and your phone's internet connection."
        variant="learn"
      />
      <Steps
        locale={locale}
        steps={[
          ["Wear", "Choose your frame, lens and configured capabilities."],
          [
            "Pair",
            "Use Bluetooth to connect supported CoWin glasses to the mobile app.",
          ],
          [
            "Connect",
            "Translation requires the CoWin app and phone internet. Glasses do not connect directly to the internet.",
          ],
        ]}
      />
    </div>
  );
}
function AppPage({ locale }: { locale: Locale }) {
  return (
    <div className={styles.page}>
      <PageHead
        eyebrow="CoWin app"
        title="The connection lives on your phone."
        intro="iOS and Android download links are environment-variable placeholders in this demo. Final permission and privacy notices must be reviewed with the production app."
        variant="learn"
      />
      <section className={`shell ${styles.section} ${styles.splitFeature}`}>
        <div className={styles.darkPlate}>
          <h2 className={styles.plateTitle}>Get the app</h2>
          <p className={styles.plateCopy}>
            Pair, personalize settings and use connected features with the CoWin
            mobile app.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="button-primary"
              href={process.env.NEXT_PUBLIC_IOS_APP_URL || "#app-link-pending"}
            >
              <Download size={17} />
              iOS download
            </a>
            <a
              className="button-secondary"
              href={
                process.env.NEXT_PUBLIC_ANDROID_APP_URL || "#app-link-pending"
              }
            >
              Android download
            </a>
          </div>
        </div>
        <div className={styles.lightPlate}>
          <h2 className={styles.plateTitle}>Permissions, clearly named.</h2>
          <ul className="mt-6 grid gap-4 text-sm leading-6 text-[var(--muted)]">
            <li>
              <Check className="mr-2 inline text-[var(--lime)]" size={17} />
              Bluetooth permission is used to pair compatible glasses.
            </li>
            <li>
              <Check className="mr-2 inline text-[var(--lime)]" size={17} />
              Camera and translation data handling require final technical
              review.
            </li>
            <li>
              <Check className="mr-2 inline text-[var(--lime)]" size={17} />
              The app&apos;s privacy terms will be updated before production
              launch.
            </li>
          </ul>
        </div>
      </section>
      <Steps
        locale={locale}
        steps={[
          [
            "Install",
            "Use the official iOS or Android listing when it is available.",
          ],
          ["Pair", "Follow on-screen Bluetooth pairing instructions."],
          [
            "Review",
            "Approve only the permissions needed for your selected features.",
          ],
        ]}
      />
    </div>
  );
}
function LensGuide() {
  return (
    <div className={styles.page}>
      <PageHead
        eyebrow="Lens Guide"
        title="Prescription lenses, without guesswork."
        intro="Some eligible frames include a standard prescription lens insert. You take that insert to an optician to fit your own prescription lenses."
        variant="learn"
      />
      <section className={`shell ${styles.section} ${styles.stepGrid}`}>
        {[
          [
            "Check",
            "Confirm that your chosen model is marked Prescription-lens ready.",
          ],
          [
            "Bring",
            "Bring the standard insert and your prescription to an optician of your choice.",
          ],
          [
            "Fit",
            "Your optician makes and fits lenses. CoWin does not provide an online prescription service in this stage.",
          ],
        ].map(([title, text]) => (
          <div className={styles.stepCard} key={title}>
            <p className={styles.stepNumber}>{title[0]}</p>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
const faqCopy: Record<Locale, { intro: string; cards: [string, string, string]; faqs: [string, string][] }> = {
  en: { intro: "Answers about delivery, support, returns and connected features.", cards: ["Find answers about connection, delivery, returns and lens inserts.", "Reach the support team by email for help with orders and product questions.", "Start a warranty request with order and issue details."], faqs: [["When will my order dispatch?", "Orders are normally processed and dispatched within 3 business days after payment is confirmed."], ["Do translation glasses connect to the internet?", "No. Translation needs the CoWin app, Bluetooth and your phone's internet connection."], ["Do you ship to Brazil?", "No. We are unable to ship to Brazil at this time."], ["How long is the warranty?", "Eligible CoWin Glasses products include a 6-month limited warranty from delivery."]] },
  ar: { intro: "إجابات حول التوصيل والدعم والإرجاع والميزات المتصلة.", cards: ["إجابات حول الاتصال والتوصيل والإرجاع وملحق العدسات.", "تواصل مع الدعم عبر البريد للمساعدة في الطلبات والمنتجات.", "ابدأ طلب ضمان مع رقم الطلب وتفاصيل المشكلة."], faqs: [["متى يتم إرسال طلبي؟", "تتم معالجة الطلبات وإرسالها عادة خلال 3 أيام عمل بعد تأكيد الدفع."], ["هل تتصل نظارات الترجمة بالإنترنت؟", "لا. تحتاج الترجمة إلى تطبيق CoWin والبلوتوث واتصال هاتفك بالإنترنت."], ["هل تشحنون إلى البرازيل؟", "لا يمكننا الشحن إلى البرازيل حالياً."], ["ما مدة الضمان؟", "تشمل المنتجات المؤهلة ضماناً محدوداً لمدة 6 أشهر من تاريخ التسليم."]] },
  es: { intro: "Respuestas sobre entrega, soporte, devoluciones y funciones conectadas.", cards: ["Respuestas sobre conexión, entrega, devoluciones e insertos de lentes.", "Escribe al equipo para recibir ayuda con pedidos y productos.", "Inicia una solicitud de garantía con el pedido y los detalles del problema."], faqs: [["¿Cuándo se enviará mi pedido?", "Los pedidos se procesan y envían normalmente en 3 días hábiles tras confirmar el pago."], ["¿Las gafas de traducción se conectan a internet?", "No. La traducción necesita la app CoWin, Bluetooth e internet en el teléfono."], ["¿Envían a Brasil?", "No podemos enviar a Brasil actualmente."], ["¿Cuánto dura la garantía?", "Los productos elegibles incluyen una garantía limitada de 6 meses desde la entrega."]] },
  pt: { intro: "Respostas sobre entrega, suporte, devoluções e recursos conectados.", cards: ["Respostas sobre conexão, entrega, devoluções e encaixe de lentes.", "Fale com a equipe por e-mail para ajuda com pedidos e produtos.", "Inicie uma solicitação de garantia com o pedido e os detalhes do problema."], faqs: [["Quando meu pedido será enviado?", "Os pedidos são processados e enviados normalmente em até 3 dias úteis após a confirmação do pagamento."], ["Os óculos de tradução se conectam à internet?", "Não. A tradução precisa do app CoWin, Bluetooth e internet no telefone."], ["Vocês enviam para o Brasil?", "Não enviamos para o Brasil no momento."], ["Quanto tempo dura a garantia?", "Produtos elegíveis incluem garantia limitada de 6 meses a partir da entrega."]] },
  ja: { intro: "配送、サポート、返品、接続機能についての回答です。", cards: ["接続、配送、返品、レンズインサートについて確認できます。", "注文や製品の質問はメールでサポートへご連絡ください。", "注文番号と問題の詳細を添えて保証申請を開始できます。"], faqs: [["注文はいつ発送されますか？", "支払い確認後、通常3営業日以内に処理・発送します。"], ["翻訳対応メガネは直接インターネットに接続しますか？", "いいえ。翻訳にはCoWinアプリ、Bluetooth、スマートフォンのインターネット接続が必要です。"], ["ブラジルへ配送できますか？", "現在ブラジルには配送できません。"], ["保証期間はどのくらいですか？", "対象製品にはお届けから6か月の限定保証が付きます。"]] },
  ko: { intro: "배송, 지원, 반품, 연결 기능에 관한 답변입니다.", cards: ["연결, 배송, 반품, 렌즈 인서트에 관한 답을 확인하세요.", "주문 및 제품 문의는 이메일로 지원팀에 연락하세요.", "주문 번호와 문제 내용을 입력해 보증 요청을 시작하세요."], faqs: [["주문은 언제 발송되나요?", "결제 확인 후 일반적으로 영업일 기준 3일 이내 처리 및 발송됩니다."], ["번역 안경이 인터넷에 직접 연결되나요?", "아닙니다. 번역에는 CoWin 앱, Bluetooth, 휴대폰 인터넷 연결이 필요합니다."], ["브라질로 배송하나요?", "현재 브라질에는 배송할 수 없습니다."], ["보증 기간은 얼마인가요?", "대상 제품은 배송일로부터 6개월 제한 보증이 제공됩니다."]] },
};

function Support({ locale, faq }: { locale: Locale; faq: boolean }) {
  const t = messages[locale];
  const localized = faqCopy[locale];
  return (
    <div className={styles.page}>
      <PageHead
        eyebrow="Support"
        title={faq ? t.support.faq : t.support.title}
        intro={
          faq
            ? localized.intro
            : t.support.intro
        }
        variant="learn"
      />
      <section className={`shell ${styles.section}`}>
        {faq ? (
          <div className={styles.readerArticle}>
            {localized.faqs.map(([question, answer]) => (
              <details
                className="border-t border-[var(--line)] py-6 first:border-t-black"
                key={question}
              >
                <summary className="cursor-pointer font-black">
                  {question}
                </summary>
                <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        ) : (
          <div className={styles.supportGrid}>
            <SupportCard
              title={t.support.faq}
              text={localized.cards[0]}
              href="/support/faq"
              locale={locale}
            />
            <SupportCard
              title={t.footer.contact}
              text={localized.cards[1]}
              href="/support/contact"
              locale={locale}
            />
            <SupportCard
              title={t.footer.warranty}
              text={localized.cards[2]}
              href="/support/warranty"
              locale={locale}
            />
          </div>
        )}
      </section>
    </div>
  );
}
function SupportCard({
  title,
  text,
  href,
  locale,
}: {
  title: string;
  text: string;
  href: string;
  locale: Locale;
}) {
  return (
    <Link
      className={styles.supportLink}
      href={`/${locale}${href}`}
    >
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">{text}</p>
      <ArrowRight className="mt-10" />
    </Link>
  );
}
function SupportContact({ locale }: { locale: Locale }) {
  return (
    <div className={styles.page}>
      <PageHead
        eyebrow="Support"
        title="Contact Support"
        intro="We’re here to help with your CoWin Glasses order, product setup, delivery, returns or warranty."
        variant="learn"
      />
      <section className={`shell ${styles.section} ${styles.reader}`}>
        <aside className={`${styles.darkPlate} h-fit`}>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#c9d4a5]">Email support</p>
          <a
            className="mt-4 block text-2xl font-black tracking-[-.04em] underline decoration-[var(--lime)] decoration-2 underline-offset-8"
            href="mailto:info@cowinglasses.com"
          >
            info@cowinglasses.com
          </a>
          <p className="mt-8 text-sm leading-6 text-zinc-300">
            Please do not return any product before receiving instructions from
            our support team.
          </p>
        </aside>
        <SupportArticle compact title="We’re here to help">
          <p>To help us resolve your request faster, please include:</p>
          <ul>
            <li>Your order number</li>
            <li>The email address used for your order</li>
            <li>A clear description of your question or issue</li>
            <li>
              Photos or videos if your product is damaged or not working as
              expected
            </li>
          </ul>
          <p>
            Email{" "}
            <a href="mailto:info@cowinglasses.com">info@cowinglasses.com</a> and
            our team will assist with the next steps.
          </p>
          <div className={`mt-8 border-t border-[var(--line)] pt-8 ${styles.formSurface}`}>
            <DemoForm locale={locale} kind="support" />
          </div>
        </SupportArticle>
      </section>
    </div>
  );
}
export function ShippingDelivery() {
  return (
    <>
      <PageHead
        eyebrow="Support"
        title="Shipping & Delivery"
        intro="International delivery information for CoWin Glasses orders."
      />
      <SupportArticle>
        <SupportSection title="International Shipping">
          <p>
            CoWin Glasses offers international delivery. Available shipping
            options and costs are shown at checkout based on your shipping
            destination. We are unable to ship to Brazil at this time.
          </p>
        </SupportSection>
        <SupportSection title="Order Processing">
          <p>
            Orders are normally processed and dispatched within{" "}
            <strong>3 business days</strong> after payment is confirmed. Orders
            placed on weekends or public holidays will be processed on the next
            business day.
          </p>
        </SupportSection>
        <SupportSection title="Delivery Times">
          <p>
            Delivery times vary by destination, shipping method, customs
            clearance and local carrier conditions. Once your order has shipped,
            you will receive a shipping confirmation email with tracking
            information when available.
          </p>
        </SupportSection>
        <SupportSection title="Customs, Duties, and Taxes">
          <p>
            International orders may be subject to import duties, taxes, customs
            fees or other local charges. These charges are determined by your
            local customs authority and are the responsibility of the recipient.
          </p>
        </SupportSection>
        <SupportSection title="Delivery Issues">
          <p>
            If your tracking shows that your package has been delivered but you
            cannot find it, please check with household members, neighbors, your
            local carrier or your building reception first.
          </p>
          <p>
            If you still need assistance, contact{" "}
            <a href="mailto:info@cowinglasses.com">info@cowinglasses.com</a> and
            include your order number.
          </p>
        </SupportSection>
        <SupportSection title="Incorrect, Damaged, or Missing Items">
          <p>
            Please inspect your order upon delivery. If an item is incorrect,
            damaged or missing, contact{" "}
            <a href="mailto:info@cowinglasses.com">info@cowinglasses.com</a> as
            soon as possible. Please include photos of the product, packaging
            and shipping label.
          </p>
        </SupportSection>
      </SupportArticle>
    </>
  );
}
export function ReturnsRefunds() {
  return (
    <>
      <PageHead
        eyebrow="Support"
        title="Returns & Refunds"
        intro="Clear steps for requesting a return and receiving a refund."
      />
      <SupportArticle>
        <SupportSection title="30-Day Returns">
          <p>
            You may request a return within <strong>30 days of delivery</strong>
            , provided that the item is unused, in its original condition and
            returned with all original packaging, accessories and proof of
            purchase.
          </p>
        </SupportSection>
        <SupportSection title="How to Start a Return">
          <ol>
            <li>
              Email{" "}
              <a href="mailto:info@cowinglasses.com">info@cowinglasses.com</a>{" "}
              with your order number and reason for return.
            </li>
            <li>
              Wait for return approval and instructions from our support team.
            </li>
            <li>Pack the product securely with all original accessories.</li>
            <li>
              Use a trackable shipping service to send the approved return.
            </li>
          </ol>
          <p>
            Please do not send a return without contacting us first.
            Unauthorised packages may not be accepted or processed.
          </p>
        </SupportSection>
        <SupportSection title="Return Address">
          <address className="not-italic">
            Returns Department — CoWin Glasses
            <br />
            Qu Shidai Future Building
            <br />
            Kecheng District, Quzhou
            <br />
            Zhejiang, China
          </address>
        </SupportSection>
        <SupportSection title="Return Shipping Costs">
          <p>
            Unless the item is faulty, damaged or sent incorrectly, return
            shipping costs are the responsibility of the customer. Original
            shipping charges, import duties, taxes and customs fees are
            non-refundable where applicable.
          </p>
        </SupportSection>
        <SupportSection title="Refunds">
          <p>
            Once your return has been received and inspected, we will notify you
            by email. If approved, your refund will be issued to the original
            payment method. Processing times may vary depending on your payment
            provider.
          </p>
        </SupportSection>
        <SupportSection title="Non-Returnable Items">
          <p>
            Products that show signs of use, damage caused after delivery,
            missing accessories or packaging that prevents resale may not be
            eligible for a refund.
          </p>
        </SupportSection>
      </SupportArticle>
    </>
  );
}
export function WarrantySupport() {
  return (
    <>
      <PageHead
        eyebrow="Support"
        title="Warranty & Support"
        intro="Support for verified manufacturing defects during the applicable warranty period."
      />
      <SupportArticle>
        <SupportSection title="Our Commitment">
          <p>
            CoWin Glasses is designed for music, moments and movement. We stand
            behind the quality of our products and provide support for
            manufacturing defects that arise during the applicable warranty
            period.
          </p>
        </SupportSection>
        <SupportSection title="What Is Covered">
          <p>
            The limited warranty covers defects in materials or workmanship
            under normal and intended use, including verified manufacturing
            defects or product components that fail during normal use.
          </p>
        </SupportSection>
        <SupportSection title="What Is Not Covered">
          <p>The warranty does not cover:</p>
          <ul>
            <li>Normal wear and tear</li>
            <li>Scratches or cosmetic damage</li>
            <li>Accidental damage, loss or theft</li>
            <li>Unauthorised repairs, alterations or modifications</li>
            <li>
              Damage caused by misuse, improper storage, liquid exposure or
              failure to follow product-care instructions
            </li>
            <li>Products purchased from unauthorised sellers</li>
          </ul>
        </SupportSection>
        <SupportSection title="How to Make a Warranty Claim">
          <p>
            Email{" "}
            <a href="mailto:info@cowinglasses.com">info@cowinglasses.com</a>{" "}
            with the following information:
          </p>
          <ul>
            <li>Your order number or proof of purchase</li>
            <li>A clear description of the issue</li>
            <li>Photos or a short video showing the problem</li>
            <li>The product serial number, if available</li>
          </ul>
          <p>
            Our support team will review your request and may provide
            troubleshooting, repair, replacement or other appropriate support.
            Please do not send your product to us until return instructions have
            been confirmed.
          </p>
        </SupportSection>
      </SupportArticle>
    </>
  );
}
function SupportArticle({
  title,
  children,
  compact = false,
}: {
  title?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "" : `shell ${styles.section}`}>
      <article className={styles.readerArticle}>
        {title && (
          <h2 className="text-3xl font-black tracking-[-.05em] text-[var(--ink)]">
            {title}
          </h2>
        )}
        {children}
      </article>
    </section>
  );
}
function SupportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}
function SearchPage({
  locale,
  products,
}: {
  locale: Locale;
  products: Product[];
}) {
  const [query, setQuery] = useState("");
  const result = products.filter((product) =>
    localize(product.name, locale).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className={styles.page}>
      <PageHead
        eyebrow="Search"
        title="Find your frame."
        intro="Search the current CoWin catalogue by model name."
      />
      <section className={`shell ${styles.section}`}>
        <label className={`${styles.searchField} flex max-w-2xl items-center gap-3 px-4`}>
          <Search />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="Search CoWin models"
          />
        </label>
        {query && (
          <div className={styles.catalogGrid}>
            {result.map((product) => (
              <ProductCard product={product} locale={locale} key={product.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
function Policy({ locale, type }: { locale: Locale; type: PolicyType }) {
  const titles: Record<Locale, Record<PolicyType, string>> = {
    en: {
      shipping: "Shipping & Delivery",
      returns: "Returns & Refunds",
      warranty: "Warranty & Support",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      "intellectual-property": "Intellectual Property Rights",
    },
    ar: {
      shipping: "الشحن والتسليم",
      returns: "الإرجاع والاسترداد",
      warranty: "الضمان والدعم",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      "intellectual-property": "حقوق الملكية الفكرية",
    },
    es: {
      shipping: "Envío y entrega",
      returns: "Devoluciones y reembolsos",
      warranty: "Garantía y soporte",
      privacy: "Política de privacidad",
      terms: "Términos de servicio",
      "intellectual-property": "Derechos de propiedad intelectual",
    },
    pt: {
      shipping: "Envio e entrega",
      returns: "Devoluções e reembolsos",
      warranty: "Garantia e suporte",
      privacy: "Política de privacidade",
      terms: "Termos de serviço",
      "intellectual-property": "Direitos de propriedade intelectual",
    },
    ja: {
      shipping: "配送とお届け",
      returns: "返品と返金",
      warranty: "保証とサポート",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      "intellectual-property": "知的財産権",
    },
    ko: {
      shipping: "배송 및 배송 안내",
      returns: "반품 및 환불",
      warranty: "보증 및 지원",
      privacy: "개인정보 처리방침",
      terms: "서비스 약관",
      "intellectual-property": "지식재산권",
    },
  };
  return (
    <div className={styles.page}>
      <PageHead title={titles[locale][type]} intro={messages[locale].common.draft} variant="learn" />
      <section className={`shell ${styles.section} ${styles.reader}`}>
        <div className={styles.readerOptic} aria-hidden="true" />
        <div className={`${styles.readerArticle} ${styles.formSurface}`}>
          <PolicyContent locale={locale} type={type} />
          {type === "warranty" && (
            <div className="mt-10 max-w-xl border-t border-black pt-8">
              <h2>{messages[locale].support.contact}</h2>
              <DemoForm locale={locale} kind="warranty" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
function Steps({ steps }: { locale: Locale; steps: [string, string][] }) {
  return (
    <section className={`shell ${styles.section} ${styles.stepGrid}`}>
      {steps.map(([title, text], index) => (
        <div className={styles.stepCard} key={title}>
          <p className={styles.stepNumber}>0{index + 1}</p>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
      ))}
    </section>
  );
}
function NotFound({ locale }: { locale: Locale }) {
  return (
    <section className={styles.statusPage}>
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.06em]">
          This frame is not here.
        </h1>
        <Link className="button-primary mt-7" href={`/${locale}/shop`}>
          Browse the shop
        </Link>
      </div>
    </section>
  );
}
