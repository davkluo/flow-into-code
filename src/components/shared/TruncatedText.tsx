"use client";

import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncatedTextProps {
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  as?: "span" | "button";
  className?: string;
  minChars?: number;
  onClick?: () => void;
}

export function TruncatedText({
  children,
  tooltip,
  as: Tag = "span",
  className,
  minChars = 20,
  onClick,
}: TruncatedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const checkTruncation = () => {
    if (ref.current) {
      setIsTruncated(ref.current.scrollWidth > ref.current.clientWidth);
    }
  };

  const element = (
    <Tag
      ref={ref as React.RefObject<HTMLButtonElement & HTMLSpanElement>}
      className={className}
      style={minChars ? { minWidth: `${minChars}ch` } : undefined}
      onClick={onClick}
      onMouseEnter={checkTruncation}
    >
      {children}
    </Tag>
  );

  if (!isTruncated) {
    return element;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{element}</TooltipTrigger>
      <TooltipContent>{tooltip ?? children}</TooltipContent>
    </Tooltip>
  );
}
