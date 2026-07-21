import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  overline: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** En-tête de section : étiquette, titre serif, filet et introduction. */
export function SectionHeading({
  overline,
  title,
  intro,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        centered && "mx-auto flex flex-col items-center text-center",
        className,
      )}
    >
      <p className="overline-label">{overline}</p>
      <h2 className="font-display mt-4 text-3xl leading-[1.12] font-medium text-balance md:text-[2.6rem]">
        {title}
      </h2>
      <span
        aria-hidden
        className={cn("hairline mt-6 w-14 bg-bronze/50", centered && "mx-auto")}
      />
      {intro ? (
        <p className="mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-taupe">
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}
