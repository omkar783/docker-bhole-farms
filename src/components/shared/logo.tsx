type LogoProps = {
  name?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: { mark: "h-10 w-10", title: "text-base", sub: "text-[8px]" },
  md: { mark: "h-14 w-14", title: "text-lg", sub: "text-[9px]" },
  lg: { mark: "h-20 w-20", title: "text-2xl", sub: "text-[11px]" },
};

export function Logo({
  name = "Bhole Farms",
  size = "md",
  showText = true,
  className = "",
}: LogoProps) {
  const classes = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        className={`${classes.mark} shrink-0`}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="60" cy="60" r="58" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="3" />
        <circle cx="60" cy="60" r="52" fill="#E8F5E9" />
        {/* Sun */}
        <circle cx="60" cy="28" r="8" fill="#F9A825" />
        {/* Sun rays */}
        <line x1="60" y1="16" x2="60" y2="12" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" />
        <line x1="69" y1="19" x2="72" y2="16" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" />
        <line x1="51" y1="19" x2="48" y2="16" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="28" x2="76" y2="28" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="28" x2="44" y2="28" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" />
        {/* Hills */}
        <path d="M18 75 Q35 55 60 70 Q85 55 102 75" fill="#43A047" opacity="0.3" />
        {/* Ground line */}
        <path d="M20 80 Q60 72 100 80" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" />
        {/* Left leaf */}
        <path d="M42 65 C35 50 25 48 20 52 C25 55 35 55 42 65Z" fill="#2E7D32" />
        <path d="M42 65 L28 55" stroke="#1B5E20" strokeWidth="1" />
        {/* Right leaf */}
        <path d="M78 65 C85 50 95 48 100 52 C95 55 85 55 78 65Z" fill="#43A047" />
        <path d="M78 65 L92 55" stroke="#2E7D32" strokeWidth="1" />
        {/* Stem */}
        <path d="M60 78 L60 60" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
        {/* Wheat grains left */}
        <ellipse cx="52" cy="58" rx="3" ry="5" fill="#F9A825" transform="rotate(-20 52 58)" />
        <ellipse cx="48" cy="54" rx="2.5" ry="4" fill="#F9A825" transform="rotate(-30 48 54)" />
        {/* Wheat grains right */}
        <ellipse cx="68" cy="58" rx="3" ry="5" fill="#F9A825" transform="rotate(20 68 58)" />
        <ellipse cx="72" cy="54" rx="2.5" ry="4" fill="#F9A825" transform="rotate(30 72 54)" />
        {/* Bottom arc */}
        <path d="M30 95 Q60 105 90 95" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      {showText && (
        <span className="leading-none">
          <span className={`block font-heading font-bold tracking-tight text-primary ${classes.title}`}>
            {name}
          </span>
          <span className={`mt-1 block font-sans font-semibold uppercase tracking-[0.25em] text-muted-foreground ${classes.sub}`}>
            Pure • Fresh • Organic
          </span>
        </span>
      )}
    </div>
  );
}
