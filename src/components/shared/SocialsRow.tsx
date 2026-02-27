"use client";

import Image from "next/image";
import { SquareCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      return "border-[#2EA043]/35 bg-[#2EA043]/12 text-[#2EA043] hover:bg-[#2EA043]/20 dark:border-[#2EA043]/45 dark:bg-[#2EA043]/20 dark:text-[#8fe09f] dark:hover:bg-[#2EA043]/26";
    case "Website":
      return "border-[#FFA733]/40 bg-[#FFA733]/16 text-[#D97706] hover:bg-[#FFA733]/24 dark:border-[#FFA733]/50 dark:bg-[#FFA733]/25 dark:text-[#FFC670] dark:hover:bg-[#FFA733]/30";
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
        <Tooltip key={social.label}>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>{social.tooltip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
