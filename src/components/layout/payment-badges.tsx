import { CreditCard } from "lucide-react";
import { supportedPaymentBrands } from "@/config/commerce";

export function PaymentBadges() {
  return (
    <div className="mt-6" aria-label="Supported card brands when checkout is activated">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
        <CreditCard size={15} aria-hidden="true" />
        <span>Secure card checkout</span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Card brands">
        {supportedPaymentBrands.map((brand) => (
          <li key={brand} className="rounded border border-white/25 bg-white px-1.5 py-1 text-[9px] font-black tracking-tight text-zinc-900">
            {brand === "American Express" ? "AMEX" : brand}
          </li>
        ))}
      </ul>
    </div>
  );
}
