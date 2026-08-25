import Image from "next/image";

const paymentMethods = [
  { name: "Visa", asset: "/images/payment-methods/visa.png" },
  { name: "Mastercard", asset: "/images/payment-methods/mastercard.png" },
  { name: "Maestro", asset: "/images/payment-methods/maestro.png" },
  { name: "JCB", asset: "/images/payment-methods/jcb.png" },
  { name: "American Express", asset: "/images/payment-methods/american-express.png" },
  { name: "Diners Club", asset: "/images/payment-methods/diners-club.png" },
  { name: "Discover", asset: "/images/payment-methods/discover.png" },
] as const;

export function PaymentMethods({ compact = false }: { compact?: boolean }) {
  return <section aria-label="Supported payment methods">
    {!compact && <p className="text-xs font-bold uppercase tracking-[.14em] text-zinc-400">Supported payment methods</p>}
    <ul className={`${compact ? "mt-0" : "mt-3"} flex flex-wrap items-center gap-2`} role="list">
      {paymentMethods.map((method) => <li className="grid h-8 w-12 place-items-center rounded-md bg-white px-1" key={method.name}>
        <Image src={method.asset} alt={method.name} width={80} height={50} className="h-auto max-h-6 w-auto max-w-10 object-contain" />
      </li>)}
    </ul>
  </section>;
}
