import { Card, RowChevron, SectionLabel } from "./ui";

/** All roles: Settings + KYC rows. */
export default function AccountBlock() {
  const items = [
    {
      label: "KYC verification",
      badge: "Pending",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="11" r="2" />
          <path d="M5.5 17c.5-1.7 1.6-2.5 3-2.5s2.5.8 3 2.5M14 9h5m-5 4h3" />
        </svg>
      ),
    },
    {
      label: "Settings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ];

  return (
    <section>
      <SectionLabel>Account</SectionLabel>
      <Card className="overflow-hidden">
        {items.map((item, i) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset ${
              i < items.length - 1 ? "border-b border-hairline-soft" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-muted" aria-hidden="true">{item.icon}</span>
              <span className="text-sm text-body">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <RowChevron />
          </button>
        ))}
      </Card>
    </section>
  );
}
