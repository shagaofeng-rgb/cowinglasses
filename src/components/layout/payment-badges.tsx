export function PaymentBadges() {
  return (
    <div className="mt-6 flex flex-wrap gap-2" aria-label="Supported payment card brands">
      <Brand label="Visa"><span className="text-[11px] font-black italic tracking-[-.08em] text-[#1a42a0]">VISA</span></Brand>
      <Brand label="Mastercard"><span className="relative h-4 w-7"><i className="absolute left-0 top-0 h-4 w-4 rounded-full bg-[#eb2028]" /><i className="absolute right-0 top-0 h-4 w-4 rounded-full bg-[#f6aa18]" /><i className="absolute left-[10px] top-0 h-4 w-2 bg-[#f1641d] opacity-90" /></span></Brand>
      <Brand label="American Express"><span className="rounded-sm bg-[#2b74b9] px-1 py-0.5 text-[7px] font-black tracking-[-.06em] text-white">AMEX</span></Brand>
      <Brand label="JCB"><span className="flex overflow-hidden rounded-sm text-[7px] font-black text-white"><i className="bg-[#1672bb] px-[1px] not-italic">J</i><i className="bg-[#e42f34] px-[1px] not-italic">C</i><i className="bg-[#3c9b52] px-[1px] not-italic">B</i></span></Brand>
      <Brand label="Discover"><span className="relative text-[6px] font-black tracking-[-.08em] text-[#17191e]">DISCOVER<i className="absolute -bottom-1 right-0 h-1 w-4 rounded-full bg-[#f68220]" /></span></Brand>
      <Brand label="Diners Club"><span className="grid h-5 w-5 place-items-center rounded-full border-[3px] border-[#2477b6] text-[9px] font-black text-[#2477b6]">D</span></Brand>
    </div>
  );
}

function Brand({ label, children }: { label: string; children: React.ReactNode }) {
  return <span role="img" aria-label={label} className="grid h-8 w-11 place-items-center rounded-[4px] bg-[#f8f9fb] shadow-[0_1px_0_rgba(255,255,255,.15)]">{children}</span>;
}
