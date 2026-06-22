import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  // Deep navy fill — the primary action
  primary:
    "bg-navy text-white shadow-[0_10px_24px_-12px_rgba(10,29,58,0.7)] hover:bg-navy-600 hover:shadow-[0_14px_30px_-12px_rgba(10,29,58,0.7)]",
  // Outlined on light
  secondary:
    "border border-line-strong bg-paper text-ink hover:border-navy/30 hover:bg-mist",
  ghost: "text-slate hover:text-navy hover:bg-mist",
  // White fill — for use on navy sections. The label is pinned to a literal
  // navy (not `text-navy`) because the global `.dark .text-navy → ink` remap
  // would otherwise turn it near-white on this always-white fill (invisible).
  light:
    "bg-white text-[#0e1b30] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] hover:bg-platinum-bright",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-13 px-8 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href !== undefined) {
    const { href, external } = props;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  // Strip the custom props so only valid button attributes spread onto <button>.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
