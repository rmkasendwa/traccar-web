export default function ReplayMapPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative h-full min-h-[24rem] overflow-hidden bg-[#dfe7e2] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#d8e3dc_0%,#edf1ee_48%,#d6e0da_100%)]" />
      <div className="absolute -left-[10%] top-[28%] h-3 w-[75%] -rotate-12 rounded-full bg-white/65 shadow-[0_0_0_1px_rgba(148,163,184,.18)]" />
      <div className="absolute -right-[8%] top-[56%] h-2.5 w-[68%] rotate-[18deg] rounded-full bg-white/55 shadow-[0_0_0_1px_rgba(148,163,184,.15)]" />
      <div className="absolute bottom-[12%] left-[42%] h-[68%] w-2 rotate-[8deg] rounded-full bg-white/45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(255,255,255,.72),transparent_34%)]" />
    </div>
  );
}
