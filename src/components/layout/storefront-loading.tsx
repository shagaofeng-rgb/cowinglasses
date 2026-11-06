import styles from "./storefront-design.module.css";

export function StorefrontLoading() {
  return <div className={styles.loadingGrid} aria-busy="true"><div /><div /><div /></div>;
}
