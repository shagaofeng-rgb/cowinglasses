import Image from "next/image";
import Link from "next/link";
import { Barlow_Condensed } from "next/font/google";
import {
  ArrowRight,
  ArrowUpRight,
  Bluetooth,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { DemoForm } from "@/components/forms/demo-form";
import { products as fixtureProducts } from "@/data/fixtures/products";
import type { Locale } from "@/lib/i18n";
import { localize } from "@/lib/i18n";
import { messages } from "@/messages";
import type { Product } from "@/types/product";
import styles from "./lensworld.module.css";

const lensDisplay = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-lens-display",
});

const featuredIds = ["g200-sport-audio-glasses", "gl1", "v03-t5"] as const;

const scenes = {
  movement: "/images/home/lensworld/movement-coast.webp",
  everyday: "/images/home/lensworld/everyday-architecture.webp",
  create: "/images/home/lensworld/create-night.webp",
} as const;

export function HomePage({ locale, products = fixtureProducts }: { locale: Locale; products?: Product[] }) {
  const t = messages[locale];
  const copy = t.home.lensworld;
  const liveProducts = products.filter((product) => !product.demo);

  if (!liveProducts.length) return null;

  const g200 = findProduct(liveProducts, featuredIds[0]);
  const gl1 = findProduct(liveProducts, featuredIds[1]);
  const v03 = findProduct(liveProducts, featuredIds[2]);
  const featured = [g200, gl1, v03];
  const musicTime = specification(g200, "Music playing time", "5–6 hours");
  const weight = specification(g200, "Weight", "43 g");

  return (
    <div className={`${styles.page} ${lensDisplay.variable}`}>
      <section className={styles.hero} aria-labelledby="lensworld-title">
        <div className={styles.heroTexture} aria-hidden="true" />
        <div className={styles.heroInner}>
          <header className={styles.masthead}>
            <p className={styles.kicker}>{copy.kicker}</p>
            <h1 id="lensworld-title" className={styles.heroTitle} aria-label={t.home.title}>
              <span>{copy.music}</span>
              <span>{copy.moments}</span>
              <span>{copy.movement}</span>
            </h1>
            <p className={styles.heroSummary}>{t.home.title}</p>
          </header>

          <div className={styles.tunnelStage} aria-label={copy.modelAxis}>
            <LensPortal
              locale={locale}
              product={g200}
              scene={scenes.movement}
              number="01"
              className={styles.portalPrimary}
              priority
            >
              <div className={styles.productCallout}>
                <p><bdi>01 — {localize(g200.name, locale)}</bdi></p>
                <strong dir="ltr">{formatUsd(g200.usdPrice)}</strong>
                <span>{t.home.music} · <bdi>{musicTime}</bdi> · <bdi>{weight}</bdi></span>
                <Link href={`/${locale}/products/${g200.slug}`} className={styles.heroCta}>
                  {copy.enter}<ArrowRight size={18} className="rtl:rotate-180" />
                </Link>
              </div>
            </LensPortal>
            <LensPortal locale={locale} product={gl1} scene={scenes.everyday} number="02" className={styles.portalSecondary} />
            <LensPortal locale={locale} product={v03} scene={scenes.create} number="03" className={styles.portalTertiary} />

            <p className={styles.bridgeCopy}>{t.home.title}</p>

            <ol className={styles.modelRail}>
              {featured.map((product, index) => (
                <li key={product.id} className={index === 0 ? styles.activeModel : undefined}>
                  <Link href={`/${locale}/products/${product.slug}`}>
                    <span>0{index + 1}</span>
                    <strong>{shortName(product)}</strong>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className={styles.mobileCommerce}>
          <span dir="ltr">{shortName(g200)} · {formatUsd(g200.usdPrice)}</span>
          <Link href={`/${locale}/products/${g200.slug}`}>{copy.enter}<ArrowRight size={17} className="rtl:rotate-180" /></Link>
        </div>
      </section>

      <section className={styles.axisSection} aria-labelledby="axis-title">
        <div className={styles.axisIntro}>
          <p className={styles.sectionIndex}>02 / {t.home.choose}</p>
          <h2 id="axis-title" className={styles.axisTitle}>{copy.findAxis}</h2>
          <p>{copy.axisCopy}</p>
        </div>
        <div className={styles.axisProduct}>
          <span className={styles.axisWord} aria-hidden="true">G200</span>
          <Image
            src={g200.heroImage}
            alt={localize(g200.name, locale)}
            width={1200}
            height={900}
            loading="eager"
            className={styles.axisImage}
            sizes="(max-width: 900px) 100vw, 60vw"
          />
          <div className={styles.axisSpecs}>
            <span><bdi>{weight}</bdi></span>
            <span><bdi>{musicTime}</bdi></span>
            <span><bdi>Bluetooth 5.3</bdi></span>
          </div>
        </div>
        <nav className={styles.axisNav} aria-label={copy.findAxis}>
          <AxisLink number="01" label={copy.move} href={`/${locale}/collections/music-movement`} active />
          <AxisLink number="02" label={copy.everyday} href={`/${locale}/collections/everyday`} />
          <AxisLink number="03" label={copy.create} href={`/${locale}/collections/create`} />
          <AxisLink number="04" label={copy.prescription} href={`/${locale}/collections/prescription-ready`} />
        </nav>
      </section>

      <section className={styles.framesSection} aria-labelledby="frames-title">
        <div className={styles.framesHeading}>
          <p className={styles.sectionIndex}>03 / {copy.modelAxis}</p>
          <h2 id="frames-title">{copy.framesTitle}</h2>
          <p>{copy.framesCopy}</p>
          <Link href={`/${locale}/shop`} className={styles.textLink}>{copy.shopAll}<ArrowUpRight size={18} /></Link>
        </div>
        <div className={styles.frameRunway}>
          {featured.map((product, index) => (
            <article key={product.id} className={styles.frameEntry}>
              <Link href={`/${locale}/products/${product.slug}`}>
                <div className={styles.frameIndex}>0{index + 1}</div>
                <div className={styles.frameImageWrap}>
                  <Image
                    src={product.heroImage}
                    alt={localize(product.name, locale)}
                    width={900}
                    height={680}
                    className={styles.frameImage}
                    sizes="(max-width: 720px) 86vw, 30vw"
                  />
                </div>
                <div className={styles.frameMeta}>
                  <div>
                    <h3>{localize(product.name, locale)}</h3>
                    <p>{index === 0 ? localize(product.tagline, locale) : copy.detailsConfirmed}</p>
                  </div>
                  <div>
                    <strong dir="ltr">{formatUsd(product.usdPrice)}</strong>
                    <span>{copy.viewModel}<ArrowRight size={15} className="rtl:rotate-180" /></span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.connectionSection} aria-labelledby="connection-title">
        <div className={styles.connectionPanel}>
          <p className={styles.sectionIndex}>04 / {copy.connectionKicker}</p>
          <div className={styles.connectionIcons} aria-hidden="true">
            <Smartphone />
            <span />
            <Bluetooth />
            <span />
            <Headphones />
          </div>
          <h2 id="connection-title">{t.home.appTitle}</h2>
          <p>{t.home.appCopy}</p>
          <Link href={`/${locale}/app`} className={styles.darkCta}>{t.common.learnMore}<ArrowRight size={18} className="rtl:rotate-180" /></Link>
        </div>
        <div className={styles.lensPanel}>
          <div>
            <p className={styles.sectionIndex}>05 / {t.nav.lensGuide}</p>
            <h2>{t.home.lensTitle}</h2>
            <Link href={`/${locale}/lens-guide`} className={styles.textLink}>{t.product.lensLink}<ArrowUpRight size={18} /></Link>
          </div>
          <Image
            src="/images/products/g200-sport-audio-glasses/dimensions.webp"
            alt=""
            width={1200}
            height={860}
            className={styles.diagramImage}
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className={styles.supportSection} aria-labelledby="support-title">
        <div>
          <p className={styles.sectionIndex}>06 / {t.nav.support}</p>
          <h2 id="support-title">{copy.supportTitle}</h2>
          <p>{copy.supportCopy}</p>
        </div>
        <div className={styles.supportGrid}>
          <SupportItem icon={<Truck />} label={t.product.dispatch} />
          <SupportItem icon={<RotateCcw />} label={t.footer.returns} />
          <SupportItem icon={<ShieldCheck />} label={t.footer.warranty} />
        </div>
      </section>

      <section className={styles.newsletterSection} aria-labelledby="newsletter-title">
        <div>
          <p className={styles.sectionIndex}>07 / CoWin updates</p>
          <h2 id="newsletter-title">{t.home.subscribe}</h2>
          <p>{t.home.subscribeCopy}</p>
        </div>
        <div className={styles.newsletterForm}><DemoForm locale={locale} kind="newsletter" /></div>
      </section>
    </div>
  );
}

function LensPortal({
  locale,
  product,
  scene,
  number,
  className,
  priority = false,
  children,
}: {
  locale: Locale;
  product: Product;
  scene: string;
  number: string;
  className: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const name = localize(product.name, locale);

  return (
    <article className={`${styles.portal} ${className}`}>
      <Link href={`/${locale}/products/${product.slug}`} className={styles.portalSurface} aria-label={`${name}, ${formatUsd(product.usdPrice)}`}>
        <Image src={scene} alt="" fill priority={priority} className={styles.sceneImage} sizes={priority ? "(max-width: 900px) 100vw, 64vw" : "(max-width: 900px) 92vw, 38vw"} />
        <span className={styles.lensTint} aria-hidden="true" />
        <span className={styles.modelStamp} dir="ltr">{number}<b>{shortName(product)}</b></span>
      </Link>
      {children}
    </article>
  );
}

function AxisLink({ number, label, href, active = false }: { number: string; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} className={active ? styles.axisLinkActive : undefined}>
      <span>{number}</span>
      <strong>{label}</strong>
      <ArrowUpRight size={20} />
    </Link>
  );
}

function SupportItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className={styles.supportItem}><span>{icon}</span><p>{label}</p></div>;
}

function findProduct(products: Product[], id: string) {
  return products.find((product) => product.id === id) ?? products[0];
}

function specification(product: Product, label: string, fallback: string) {
  return product.specifications.find((row) => row.label.en === label)?.value.en ?? fallback;
}

function shortName(product: Product) {
  return product.name.en.replace(/ Smart Glasses| Sport Audio Glasses/, "");
}

function formatUsd(value: number) {
  return `USD ${value.toFixed(2)}`;
}
