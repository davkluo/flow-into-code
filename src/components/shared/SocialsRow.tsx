"use client";

import Image from "next/image";
import { SquareCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdaptiveTooltip,
  AdaptiveTooltipContent,
  AdaptiveTooltipTrigger,
} from "@/components/ui/adaptive-tooltip";
import { cn } from "@/lib/utils";
import { GitHubLogo } from "./GitHubLogo";
import { LinkedInLogo } from "./LinkedInLogo";

export type SocialLink = {
  label: string;
  href: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
};

function PersonalWebsiteIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/personal-website-logo.svg"
      alt=""
      aria-hidden
      width={16}
      height={16}
      className={className}
    />
  );
}

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/davidkluo",
    tooltip: "LinkedIn profile",
    icon: LinkedInLogo,
  },
  {
    label: "GitHub",
    href: "https://github.com/davkluo",
    tooltip: "GitHub profile",
    icon: GitHubLogo,
  },
  {
    label: "This Repo",
    href: "https://github.com/davkluo/flow-into-code",
    tooltip: "Flow Into Code repository",
    icon: SquareCode,
  },
  {
    label: "Website",
    href: "https://www.davidluo.me",
    tooltip: "Personal website",
    icon: PersonalWebsiteIcon,
  },
];

type SocialsRowProps = {
  links?: SocialLink[];
  className?: string;
};

function socialToneClass(label: string): string {
  switch (label) {
    case "LinkedIn":
      return "border-[#0A66C2]/35 bg-[#0A66C2]/12 text-[#0A66C2] hover:bg-[#0A66C2]/20 dark:border-[#0A66C2]/45 dark:bg-[#0A66C2]/22 dark:text-[#7cc0ff] dark:hover:bg-[#0A66C2]/28";
    case "GitHub":
      return "border-[#24292f]/25 bg-[#24292f]/10 text-[#24292f] hover:bg-[#24292f]/16 dark:border-[#f0f6fc]/30 dark:bg-[#f0f6fc]/12 dark:text-[#f0f6fc] dark:hover:bg-[#f0f6fc]/18";
    case "This Repo":
      return "border-brand-secondary/35 bg-brand-secondary/12 text-brand-secondary hover:bg-brand-secondary/20 dark:border-brand-secondary/45 dark:bg-brand-secondary/22 dark:hover:bg-brand-secondary/28";
    case "Website":
      return "border-[#22a84a]/35 bg-[#22a84a]/12 text-[#16a34a] hover:bg-[#22a84a]/20 dark:border-[#22a84a]/45 dark:bg-[#22a84a]/22 dark:text-[#86efac] dark:hover:bg-[#22a84a]/28";
    default:
      return "border-foreground/20 bg-foreground/10 text-foreground hover:bg-foreground/15 dark:bg-foreground/15 dark:hover:bg-foreground/20";
  }
}

export function SocialsRow({
  links = DEFAULT_SOCIAL_LINKS,
  className,
}: SocialsRowProps) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-2 pt-1", className)}>
      {links.map((social) => (
        <AdaptiveTooltip key={social.label}>
          <AdaptiveTooltipTrigger asChild>
            <Button
              asChild
              size="icon-sm"
              variant="ghost"
              className={cn(
                "rounded-full border shadow-sm",
                socialToneClass(social.label),
              )}
              aria-label={social.label}
            >
              <a href={social.href} target="_blank" rel="noreferrer">
                <social.icon className="size-4" />
              </a>
            </Button>
          </AdaptiveTooltipTrigger>
          <AdaptiveTooltipContent sideOffset={6}>{social.tooltip}</AdaptiveTooltipContent>
        </AdaptiveTooltip>
      ))}
    </div>
  );
}
