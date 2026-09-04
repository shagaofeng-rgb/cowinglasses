import Image from "next/image";
import type { Product } from "@/types/product";
import styles from "@/components/layout/storefront-design.module.css";

type Feature = {
  icon: string;
  title: string;
  detail: string;
};

const g200Features: Feature[] = [
  {
    icon: "/images/features/windproof-dustproof.webp",
    title: "Windproof & dustproof",
    detail: "Sport-oriented wraparound design.",
  },
  {
    icon: "/images/features/open-audio.webp",
    title: "Open audio",
    detail: "Single moving-coil speaker.",
  },
  {
    icon: "/images/features/magnetic-charging.webp",
    title: "Magnetic charging",
    detail: "DC 5V input, 1.5-hour charge time.",
  },
  {
    icon: "/images/features/outdoor-uv-lens.webp",
    title: "Outdoor lens",
    detail: "UV400 protection shown in supplied design.",
  },
];

const orderSupportFeatures: Feature[] = [
  {
    icon: "/images/features/windproof-dustproof.webp",
    title: "Product preview",
    detail: "Review the supplied product imagery before requesting an order.",
  },
  {
    icon: "/images/features/open-audio.webp",
    title: "Colour preference",
    detail: "Select your preferred colour for the sales request.",
  },
  {
    icon: "/images/features/magnetic-charging.webp",
    title: "Sales confirmation",
    detail: "Final configuration and availability are confirmed before payment.",
  },
  {
    icon: "/images/features/outdoor-uv-lens.webp",
    title: "Delivery support",
    detail: "Shipping and final order details are confirmed for your destination.",
  },
];

export function ProductFeatureBand({ product }: { product: Product }) {
  const isG200 = product.id === "g200-sport-audio-glasses";
  const features = isG200 ? g200Features : orderSupportFeatures;
  const label = isG200 ? "G200 product features" : "Order support";

  return (
    <section className={`${styles.featureBand} border-y`} aria-label={label}>
      <div className="shell grid divide-y divide-[var(--line)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex min-h-28 items-center gap-3 py-5 sm:px-5 lg:px-6">
            <Image src={feature.icon} alt="" width={160} height={160} className="h-12 w-12 shrink-0 object-contain" />
            <div>
              <p className="text-sm font-black tracking-[-.02em]">{feature.title}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{feature.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
