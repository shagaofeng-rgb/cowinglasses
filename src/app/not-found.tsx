import Link from "next/link";
import styles from "@/components/layout/storefront-design.module.css";
export default function NotFound() { return <main className={styles.statusPage}><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--lime)]">404</p><h1 className="mt-4">Page not found.</h1><Link className="button-primary mt-8" href="/en">Return home</Link></div></main>; }
