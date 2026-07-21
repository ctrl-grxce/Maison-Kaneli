import { cn } from "@/lib/utils";

interface LogotypeProps {
  className?: string;
  /** Taille de base en rem du mot « KANALI ». */
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "text-[0.95rem]",
  md: "text-[1.15rem]",
  lg: "text-[1.6rem]",
};

/** Reproduction typographique du logo — nette à toutes les résolutions. */
export function Logotype({ className, size = "md" }: LogotypeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[0.45em] whitespace-nowrap text-bronze",
        SIZES[size],
        className,
      )}
    >
      <span className="font-display text-[1.5em] leading-none font-medium italic">
        Maison
      </span>
      <span className="relative font-display leading-none font-medium tracking-[0.3em] uppercase">
        Kanali
        <span
          aria-hidden
          className="absolute right-[0.3em] -bottom-[0.4em] left-0 h-px bg-current opacity-70"
        />
      </span>
    </span>
  );
}

/** Marque Naftali en texte — utilisée hors des visuels officiels. */
export function NaftaliMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-[1.5em] leading-none font-medium text-gold italic",
        className,
      )}
    >
      Naftali
    </span>
  );
}
