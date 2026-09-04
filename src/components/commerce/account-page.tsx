"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "@/components/layout/storefront-design.module.css";

type AccountOrder = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  currency: string;
  totalAmount: string;
  shippingAmount: string;
  createdAt: string;
  items: {
    productName: string;
    skuCode: string | null;
    quantity: number;
    totalAmount: string;
  }[];
};
type AccountData = {
  customer: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  orders: AccountOrder[];
};

const copy = {
  en: {
    eyebrow: "Member account",
    title: "Your orders, wherever you sign in.",
    intro:
      "Every checkout creates or uses a secure member account. Sign in with the email and password used at checkout.",
    email: "Email address",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    orders: "Order history",
    empty: "No orders have been placed since this account was activated.",
    old: "For security, orders placed before account activation are not shown automatically. Contact support to verify and link an earlier order.",
    signOut: "Sign out",
    total: "Total",
    shipping: "Shipping",
    payment: "Payment",
    fulfillment: "Fulfillment",
    invalid: "Email or password is incorrect.",
    locked: "This account is temporarily locked. Try again in 15 minutes.",
    unavailable: "Account service is temporarily unavailable.",
  },
  ar: {
    eyebrow: "حساب العضو",
    title: "طلباتك أينما سجلت الدخول.",
    intro:
      "كل عملية دفع تنشئ حساب عضو آمناً أو تستخدمه. سجّل الدخول بالبريد وكلمة المرور المستخدمين عند الدفع.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ تسجيل الدخول…",
    orders: "سجل الطلبات",
    empty: "لا توجد طلبات منذ تفعيل هذا الحساب.",
    old: "لأسباب أمنية، لا تظهر الطلبات السابقة لتفعيل الحساب تلقائياً. تواصل مع الدعم لربط طلب سابق بعد التحقق.",
    signOut: "تسجيل الخروج",
    total: "الإجمالي",
    shipping: "الشحن",
    payment: "الدفع",
    fulfillment: "التنفيذ",
    invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    locked: "الحساب مقفل مؤقتاً. حاول بعد 15 دقيقة.",
    unavailable: "خدمة الحساب غير متاحة مؤقتاً.",
  },
  es: {
    eyebrow: "Cuenta de miembro",
    title: "Tus pedidos, dondequiera que inicies sesión.",
    intro:
      "Cada compra crea o utiliza una cuenta segura. Accede con el correo y la contraseña usados al comprar.",
    email: "Correo electrónico",
    password: "Contraseña",
    signIn: "Iniciar sesión",
    signingIn: "Iniciando sesión…",
    orders: "Historial de pedidos",
    empty: "No hay pedidos desde que se activó esta cuenta.",
    old: "Por seguridad, los pedidos anteriores a la activación no aparecen automáticamente. Contacta con soporte para verificarlos y vincularlos.",
    signOut: "Cerrar sesión",
    total: "Total",
    shipping: "Envío",
    payment: "Pago",
    fulfillment: "Preparación",
    invalid: "El correo o la contraseña no son correctos.",
    locked: "La cuenta está bloqueada temporalmente. Inténtalo en 15 minutos.",
    unavailable: "El servicio de cuenta no está disponible temporalmente.",
  },
  pt: {
    eyebrow: "Conta de membro",
    title: "Seus pedidos, onde quer que você entre.",
    intro:
      "Cada compra cria ou usa uma conta segura. Entre com o e-mail e a senha usados no checkout.",
    email: "E-mail",
    password: "Senha",
    signIn: "Entrar",
    signingIn: "Entrando…",
    orders: "Histórico de pedidos",
    empty: "Nenhum pedido foi feito desde a ativação desta conta.",
    old: "Por segurança, pedidos anteriores à ativação não aparecem automaticamente. Fale com o suporte para verificar e vinculá-los.",
    signOut: "Sair",
    total: "Total",
    shipping: "Frete",
    payment: "Pagamento",
    fulfillment: "Preparação",
    invalid: "E-mail ou senha incorretos.",
    locked: "A conta está temporariamente bloqueada. Tente em 15 minutos.",
    unavailable: "O serviço de conta está temporariamente indisponível.",
  },
  ja: {
    eyebrow: "メンバーアカウント",
    title: "どのブラウザからでも注文を確認。",
    intro:
      "チェックアウト時に安全な会員アカウントを作成または利用します。購入時のメールアドレスとパスワードでログインしてください。",
    email: "メールアドレス",
    password: "パスワード",
    signIn: "ログイン",
    signingIn: "ログイン中…",
    orders: "注文履歴",
    empty: "アカウント有効化後の注文はまだありません。",
    old: "安全のため、有効化前の注文は自動表示されません。過去の注文を連携するにはサポートへご連絡ください。",
    signOut: "ログアウト",
    total: "合計",
    shipping: "送料",
    payment: "支払い",
    fulfillment: "発送状況",
    invalid: "メールアドレスまたはパスワードが正しくありません。",
    locked: "アカウントは一時的にロックされています。15分後にお試しください。",
    unavailable: "アカウントサービスは一時的に利用できません。",
  },
  ko: {
    eyebrow: "회원 계정",
    title: "어디서 로그인하든 주문을 확인하세요.",
    intro:
      "결제할 때 안전한 회원 계정을 생성하거나 사용합니다. 결제 시 사용한 이메일과 비밀번호로 로그인하세요.",
    email: "이메일",
    password: "비밀번호",
    signIn: "로그인",
    signingIn: "로그인 중…",
    orders: "주문 내역",
    empty: "계정 활성화 이후 주문이 없습니다.",
    old: "보안을 위해 활성화 이전 주문은 자동으로 표시되지 않습니다. 이전 주문 연결은 지원팀에 문의하세요.",
    signOut: "로그아웃",
    total: "합계",
    shipping: "배송비",
    payment: "결제",
    fulfillment: "배송 처리",
    invalid: "이메일 또는 비밀번호가 올바르지 않습니다.",
    locked: "계정이 일시적으로 잠겼습니다. 15분 후 다시 시도하세요.",
    unavailable: "계정 서비스를 일시적으로 사용할 수 없습니다.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function AccountPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    const response = await fetch("/api/storefront/account", {
      cache: "no-store",
    });
    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      data?: AccountData;
    } | null;
    setData(response.ok && result?.success ? (result.data ?? null) : null);
    setLoading(false);
  }
  useEffect(() => {
    let active = true;
    void fetch("/api/storefront/account", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json().catch(() => null) as { success?: boolean; data?: AccountData } | null }))
      .then(({ response, result }) => {
        if (!active) return;
        setData(response.ok && result?.success ? (result.data ?? null) : null);
        setLoading(false);
      })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function login(formData: FormData) {
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/storefront/account/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const result = (await response.json().catch(() => null)) as {
      error?: { code?: string };
    } | null;
    if (!response.ok) {
      setError(
        result?.error?.code === "ACCOUNT_LOCKED"
          ? t.locked
          : result?.error?.code === "INVALID_CREDENTIALS"
            ? t.invalid
            : t.unavailable,
      );
      setSubmitting(false);
      return;
    }
    await load();
    setSubmitting(false);
  }
  async function logout() {
    await fetch("/api/storefront/account/logout", { method: "POST" });
    setData(null);
  }
  return (
    <div className={styles.accountPage}>
      <section className={styles.accountHeader}>
        <div className="shell py-16 md:py-24">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className={styles.accountTitle}>
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl leading-7 text-[#c2cbce]">
              {t.intro}
            </p>
            <p className="mt-7 text-xs font-bold uppercase tracking-[.14em] text-[var(--lime)]">{t.eyebrow}</p>
          </div>
          {data && (
            <button
              type="button"
              onClick={logout}
              className="button-secondary w-fit"
            >
              {t.signOut}
            </button>
          )}
          </div>
        </div>
      </section>
      <section className={`shell min-h-[38dvh] ${styles.section} ${styles.formSurface}`}>
        {loading ? (
          <div
            className="h-40 animate-pulse rounded-2xl bg-white"
            aria-label="Loading"
          />
        ) : data ? (
          <section>
            <div className={`${styles.accountIdentity} p-5`}>
              <p className="font-black">
                {[data.customer.firstName, data.customer.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {data.customer.email}
              </p>
            </div>
            <h2 className="mt-10 text-2xl font-black">{t.orders}</h2>
            {data.orders.length ? (
              <div className="mt-4 grid gap-4">
                {data.orders.map((order) => (
                  <article
                    key={order.orderNumber}
                    className={styles.orderCard}
                  >
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="font-mono font-black">
                          {order.orderNumber}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {new Intl.DateTimeFormat(locale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(order.createdAt))}
                        </p>
                      </div>
                      <strong>
                        {order.currency} {Number(order.totalAmount).toFixed(2)}
                      </strong>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-full bg-[#eff4e8] px-3 py-1.5">
                        {t.payment}: {order.paymentStatus}
                      </span>
                      <span className="rounded-full bg-[#eff4e8] px-3 py-1.5">
                        {t.fulfillment}: {order.fulfillmentStatus}
                      </span>
                    </div>
                    <div className="mt-5 divide-y divide-[var(--line)] border-t border-[var(--line)]">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.skuCode}-${index}`}
                          className="flex justify-between gap-4 py-3 text-sm"
                        >
                          <span>
                            {item.productName} × {item.quantity}
                          </span>
                          <strong>
                            {order.currency}{" "}
                            {Number(item.totalAmount).toFixed(2)}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-[var(--muted)]">
                      {t.shipping}: {order.currency}{" "}
                      {Number(order.shippingAmount).toFixed(2)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-white p-6 text-[var(--muted)]">
                {t.empty}
              </p>
            )}
            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              {t.old}
            </p>
          </section>
        ) : (
          <form
            action={login}
            className={styles.accountForm}
          >
            <label className="grid gap-2">
              <span className="text-sm font-bold">{t.email}</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-h-12 rounded-xl border border-[var(--line)] px-4 outline-none focus:ring-2 focus:ring-[var(--lime)]"
              />
            </label>
            <label className="mt-4 grid gap-2">
              <span className="text-sm font-bold">{t.password}</span>
              <input
                name="password"
                type="password"
                minLength={10}
                maxLength={128}
                autoComplete="current-password"
                required
                className="min-h-12 rounded-xl border border-[var(--line)] px-4 outline-none focus:ring-2 focus:ring-[var(--lime)]"
              />
            </label>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}
            <button
              disabled={submitting}
              className="button-primary mt-6 w-full disabled:opacity-60"
            >
              {submitting ? t.signingIn : t.signIn}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
