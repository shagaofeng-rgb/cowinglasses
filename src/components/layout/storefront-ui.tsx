import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./storefront-design.module.css";

export function InteriorHead({ eyebrow, title, intro, image, aside }: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: { src: string; alt: string; kind?: "scene" | "product"; caption?: string };
  aside?: ReactNode;
}) {
  return (
    <header className={`${styles.pageHero} ${image?.kind === "scene" ? styles.sceneHero : ""}`}>
      {image?.kind === "scene" && <Image src={image.src} alt="" fill sizes="100vw" className={styles.sceneImage} />}
      <div className={`shell ${styles.pageHeroShell} ${image?.kind === "product" ? styles.heroWithMedia : ""}`}>
        <div className={styles.pageHeroCopy}>
          <p className={styles.kicker}>{eyebrow}</p>
          <h1 className={styles.pageHeroTitle}>{title}</h1>
          {intro && <p className={styles.pageHeroIntro}>{intro}</p>}
        </div>
        {aside && <div className={styles.heroAside}>{aside}</div>}
        {image?.kind === "product" && <figure>
          <div className={styles.heroProduct}><Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 90vw, 36vw" /></div>
          {image.caption && <figcaption className={styles.heroProductCaption}>{image.caption}</figcaption>}
        </figure>}
      </div>
    </header>
  );
}

export function PanelLink({ href, icon, title, description }: {
  href: string;
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return <Link href={href} className={styles.supportLink}>
    <span className={styles.panelIcon} aria-hidden="true">{icon}</span>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
    <ArrowUpRight size={18} className={`${styles.panelArrow} rtl:-rotate-90`} aria-hidden="true" />
  </Link>;
}
