"use client";
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { CartLine, CurrencyCode } from "@/types/commerce";

type CartState = { lines: CartLine[]; hydrated: boolean; currency: CurrencyCode };
type Action = { type: "hydrate"; state: Partial<CartState> } | { type: "add"; line: CartLine } | { type: "setQuantity"; key: Pick<CartLine, "productId" | "skuId">; quantity: number } | { type: "remove"; key: Pick<CartLine, "productId" | "skuId"> } | { type: "currency"; currency: CurrencyCode };
const initial: CartState = { lines: [], hydrated: false, currency: "USD" };
function reducer(state: CartState, action: Action): CartState {
  if (action.type === "hydrate") return { ...state, ...action.state, hydrated: true };
  if (action.type === "currency") return { ...state, currency: action.currency };
  if (action.type === "add") { const found = state.lines.find((line) => line.productId === action.line.productId && line.skuId === action.line.skuId); return { ...state, lines: found ? state.lines.map((line) => line === found ? { ...line, quantity: line.quantity + action.line.quantity } : line) : [...state.lines, action.line] }; }
  if (action.type === "setQuantity") return { ...state, lines: action.quantity < 1 ? state.lines.filter((line) => !(line.productId === action.key.productId && line.skuId === action.key.skuId)) : state.lines.map((line) => line.productId === action.key.productId && line.skuId === action.key.skuId ? { ...line, quantity: action.quantity } : line) };
  return { ...state, lines: state.lines.filter((line) => !(line.productId === action.key.productId && line.skuId === action.key.skuId)) };
}
const CartContext = createContext<(CartState & { add(line: CartLine): void; setQuantity(key: Pick<CartLine, "productId" | "skuId">, quantity: number): void; remove(key: Pick<CartLine, "productId" | "skuId">): void; setCurrency(currency: CurrencyCode): void }) | null>(null);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  useEffect(() => { const saved = window.localStorage.getItem("cowin-cart"); if (saved) { try { dispatch({ type: "hydrate", state: JSON.parse(saved) }); return; } catch { /* safe default */ } } dispatch({ type: "hydrate", state: {} }); }, []);
  useEffect(() => { if (state.hydrated) window.localStorage.setItem("cowin-cart", JSON.stringify({ lines: state.lines, currency: state.currency })); }, [state]);
  const value = useMemo(() => ({ ...state, add: (line: CartLine) => dispatch({ type: "add", line }), setQuantity: (key: Pick<CartLine, "productId" | "skuId">, quantity: number) => dispatch({ type: "setQuantity", key, quantity }), remove: (key: Pick<CartLine, "productId" | "skuId">) => dispatch({ type: "remove", key }), setCurrency: (currency: CurrencyCode) => dispatch({ type: "currency", currency }) }), [state]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used within CartProvider"); return context; }
