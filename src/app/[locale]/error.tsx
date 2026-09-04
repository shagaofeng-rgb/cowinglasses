"use client";
import styles from "@/components/layout/storefront-design.module.css";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <section className={styles.statusPage}><div><h2>Something interrupted this view.</h2><p className="mx-auto mt-5 max-w-lg text-[#c2cbce]">Please try again. Your cart is stored locally.</p><button className="button-primary mt-7" onClick={reset}>Try again</button></div></section>; }
