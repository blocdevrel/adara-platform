import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type MintButtonProps = {
  to?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
  onClick?: () => void;
};

const sizeClass = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

const baseClass =
  "inline-flex items-center justify-center rounded-full bg-primary font-medium text-primary-foreground transition-colors hover:bg-adara-orange-hover active:bg-adara-orange-active";

export function MintButton({
  to,
  href,
  children,
  className,
  size = "md",
  type = "button",
  onClick,
}: MintButtonProps) {
  const classes = cn(baseClass, sizeClass[size], className);

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
