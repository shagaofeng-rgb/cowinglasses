"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { adminNavigation } from "@/features/admin/navigation";

type AdminShellProps = { children: ReactNode };

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#13201a]">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-black/10 bg-white px-4 lg:hidden">
        <button aria-label="打开后台导航" className="rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold" onClick={() => setMobileOpen(true)}>菜单</button>
        <span className="font-serif text-lg font-bold">COWIN 后台</span>
        <Link href="/en" className="text-xs font-semibold underline">查看商城</Link>
      </header>

      {mobileOpen ? <button aria-label="关闭导航" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col bg-[#101914] text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-[88px]" : "lg:w-[286px]"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="min-w-0" onClick={() => setMobileOpen(false)}>
            <p className="truncate text-lg font-black tracking-[-0.04em]">COWIN<span className="text-[#b8e629]">.</span></p>
            {!collapsed ? <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/55">零售运营后台</p> : null}
          </Link>
          <button aria-label="折叠导航" className="hidden rounded-md border border-white/15 px-2 py-1 text-xs text-white/70 lg:block" onClick={() => setCollapsed((value) => !value)}>{collapsed ? "›" : "‹"}</button>
          <button aria-label="关闭导航" className="rounded-md border border-white/15 px-2 py-1 text-xs lg:hidden" onClick={() => setMobileOpen(false)}>×</button>
        </div>

        <nav aria-label="后台主导航" className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {adminNavigation.map((group) => (
            <section key={group.label} className="mb-6">
              {!collapsed ? <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#b8e629]">{group.label}</p> : null}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return <li key={item.href}>
                    <Link title={collapsed ? item.label : undefined} href={item.href} onClick={() => setMobileOpen(false)} className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-[#264436] text-white shadow-sm" : "text-white/72 hover:bg-white/8 hover:text-white"}`}>
                      <span className={`mr-3 h-2 w-2 shrink-0 rounded-full ${active ? "bg-[#b8e629]" : item.state === "setup" ? "bg-white/25" : "bg-white/55"}`} />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </Link>
                  </li>;
                })}
              </ul>
            </section>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          {!collapsed ? <><p className="text-sm font-semibold">管理员准备中</p><p className="mt-1 text-xs leading-5 text-white/55">权限、数据库与登录将在下一阶段接入。</p></> : <span className="mx-auto block h-3 w-3 rounded-full bg-[#b8e629]" />}
        </div>
      </aside>

      <main className={`min-h-screen transition-[padding] lg:pl-[286px] ${collapsed ? "lg:pl-[88px]" : ""}`}>{children}</main>
    </div>
  );
}
