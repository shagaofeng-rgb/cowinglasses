"use client";

import { AlertCircle, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export type OceanpaymentSession = {
  account: string;
  terminal: string;
  signValue: string;
  key: string;
  order_number: string;
  order_currency: "USD";
  order_amount: string;
  backUrl: string;
  noticeUrl: string;
  methods: "Credit Card";
  billing_lastName: string;
  billing_firstName: string;
  billing_email: string;
  billing_country: string;
  billing_state: string;
  billing_city: string;
  billing_address: string;
  billing_zip: string;
  billing_ip: string;
  productName: string;
  productNum: string;
  productSku: string;
  productPrice: string;
};

type OceanpaymentApi = { init: (sandbox: boolean | string, first: string, second: string) => void; checkout: (payload: OceanpaymentSession) => void };

declare global {
  interface Window {
    Oceanpayment?: OceanpaymentApi;
    oceanpaymentCallBack?: (data: unknown) => void;
  }
}

function loadScript(id: string, src: string) {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing?.dataset.loaded === "true") return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = existing ?? document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => reject(new Error("Unable to load the secure payment component."));
    if (!existing) document.head.appendChild(script);
  });
}

export function OceanpaymentEmbed({ session, production }: { session: OceanpaymentSession; production: boolean }) {
  const [state, setState] = useState<"loading" | "ready" | "submitting" | "processing" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function boot() {
      try {
        await loadScript("oceanpayment-jquery", "https://secure.oceanpayment.com/pub/js/jquery/jq.js");
        await loadScript("oceanpayment-sdk", "https://secure.oceanpayment.com/pages/js/oceanpayment.js");
        if (!window.Oceanpayment) throw new Error("The secure payment component did not initialize.");
        window.oceanpaymentCallBack = (data: unknown) => {
          const response = data as { msg?: unknown; pay_url?: unknown } | undefined;
          if (response?.msg) {
            setMessage(String(response.msg));
            setState("error");
            return;
          }
          if (typeof response?.pay_url === "string" && response.pay_url) {
            window.location.assign(response.pay_url);
            return;
          }
          setState("processing");
          setMessage("Payment submitted. We are confirming the final result securely.");
        };
        // Oceanpayment documents true for sandbox and an empty value for production.
        window.Oceanpayment.init(production ? "" : true, "", "");
        if (active) setState("ready");
      } catch (error) {
        if (active) {
          setState("error");
          setMessage(error instanceof Error ? error.message : "Unable to load the secure payment component.");
        }
      }
    }
    void boot();
    return () => { active = false; };
  }, [production]);

  function pay() {
    if (!window.Oceanpayment || state !== "ready") return;
    setState("submitting");
    setMessage("");
    try {
      window.Oceanpayment.checkout(session);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to start secure payment.");
    }
  }

  return <section className="mt-6 rounded-3xl border border-[#c7d887] bg-[#f7fbe9] p-5" aria-live="polite">
    <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-[#657800]" size={21}/><div><p className="font-black">Secure card payment</p><p className="mt-1 text-sm leading-6 text-[#455216]">Card details are entered in Oceanpayment&apos;s secure embedded component. CoWin does not store your full card number or CVV.</p></div></div>
    <div id="oceanpayment-element" className="mt-5 min-h-12" />
    {state === "loading" && <p className="mt-4 flex items-center gap-2 text-sm text-[#455216]"><LoaderCircle className="animate-spin" size={16}/> Loading secure card form…</p>}
    {state === "processing" && <p className="mt-4 rounded-xl bg-white p-3 text-sm leading-6 text-[#455216]">{message}</p>}
    {state === "error" && <p role="alert" className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={17}/>{message}</p>}
    <button type="button" onClick={pay} disabled={state !== "ready"} className="button-primary mt-5 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"><CreditCard size={18}/>{state === "submitting" ? "Opening secure payment…" : "Pay securely by card"}</button>
    <p className="mt-3 text-xs leading-5 text-[#455216]">Order {session.order_number} · USD {session.order_amount}. Your order is marked paid only after Oceanpayment&apos;s verified server notification.</p>
  </section>;
}
