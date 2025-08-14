"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { ModeSelect } from "./ModeSelect";

interface SubMenuItem {
  label: string;
  url: string;
  description: string;
}

interface MenuItem {
  label: string;
  url: string;
  items?: SubMenuItem[];
}

const Navbar = () => {
  const { user, status, signOutUser } = useAuth();

  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const currentTheme = mounted ? resolvedTheme : "dark";

  const publicMenu: MenuItem[] = [
    {
      label: "About",
      url: "/about",
    },
  ];
  const authenticatedMenu: MenuItem[] = [
    {
      label: "Dashboard",
      url: "/dashboard",
    },
    {
      label: "History",
      url: "/history",
    },
    {
      label: "Practice",
      url: "/practice",
    },
  ];

  const navbarMenu =
    status === "authenticated"
      ? [...publicMenu, ...authenticatedMenu]
      : publicMenu;

  useEffect(() => {
    // Ensure the theme is mounted before rendering
    setMounted(true);
  }, []);

  return (
    <nav>
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex w-full items-center sm:hidden">
            {/* Mobile Menu */}
            <div className="flex w-full items-center justify-between">
              <Link
                href="/"
                className="mt-2.5 flex h-auto w-32 shrink-0 items-center"
              >
                <Image
                  src={
                    currentTheme === "dark"
                      ? "/logo-dark.png"
                      : "/logo-light.png"
                  }
                  alt="FlowIntoCode Logo"
                  width={120}
                  height={32}
                  priority
                />
              </Link>{" "}
              <Sheet>
                <div className="flex items-center gap-2">
                  <ModeSelect />
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="aspect-square"
                    >
                      <Menu className="size-4" />
                    </Button>
                  </SheetTrigger>
                </div>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Flow Into Code</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 p-4">
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {navbarMenu.map((item) => renderMobileMenuItem(item))}
                    </Accordion>

                    <Separator />

                    <div className="flex flex-col gap-3">
                      <Button asChild variant="outline">
                        <Link href="/signin">Sign In</Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden w-full items-center justify-between sm:flex">
            <div className="flex items-center gap-2">
              {/* Logo */}
              <Link
                href="/"
                className="mt-2.5 flex h-auto w-32 shrink-0 items-center"
              >
                <Image
                  src={
                    currentTheme === "dark"
                      ? "/logo-dark.png"
                      : "/logo-light.png"
                  }
                  alt="FlowIntoCode Logo"
                  width={120}
                  height={32}
                  priority
                />
              </Link>
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  {navbarMenu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div className="flex items-center gap-2">
              <ModeSelect />
              {status === "authenticated" ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Avatar>
                      <AvatarImage
                        src={user?.photoURL || ""}
                        alt="User Avatar"
                      />
                      <AvatarFallback>
                        {user?.displayName
                          ?.split(" ")
                          .map((name) => name.charAt(0))
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </PopoverTrigger>
                  <PopoverContent className="mt-2 mr-4 w-80">
                    <div className="text-lg font-semibold">
                      {user?.displayName || "User"}
                    </div>

                    <p className="text-muted-foreground text-xs">
                      {user?.email || "No email available"}
                    </p>

                    <div className="mt-4 flex flex-col">
                      <Button asChild>
                        <Link href="#">Settings</Link>
                      </Button>
                      <Separator className="my-4" />

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={signOutUser}
                      >
                        Sign Out
                      </Button>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Signed in via{" "}
                        <span className="font-medium">
                          {(() => {
                            const providerId =
                              user?.providerData[0]?.providerId || "unknown";
                            switch (providerId) {
                              case "google.com":
                                return "Google";
                              case "facebook.com":
                                return "Facebook";
                              case "github.com":
                                return "GitHub";
                              case "twitter.com":
                                return "Twitter";
                              default:
                                return "Unknown";
                            }
                          })()}
                        </span>
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/signin">Sign In</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
};

// Desktop Menu
const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.label}>
        <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[300px]">
            {item.items.map((subItem) => (
              <li key={subItem.label}>
                <SubMenuLink item={subItem} />{" "}
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.label}>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link href={item.url}>{item.label}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

// Mobile Menu
const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.label} value={item.label} className="border-b-0">
        <AccordionTrigger className="text-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md p-3 leading-none font-semibold transition-colors hover:no-underline">
          {item.label}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.label} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link
      key={item.label}
      href={item.url}
      className="text-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 block rounded-md p-3 leading-none font-semibold no-underline transition-colors outline-none focus-visible:ring-[3px] focus-visible:outline-none"
    >
      {item.label}
    </Link>
  );
};

// SubMenuLink component for both desktop and mobile
const SubMenuLink = ({ item }: { item: SubMenuItem }) => {
  return (
    <Link
      href={item.url}
      className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
    >
      <div className="text-sm leading-none font-medium">{item.label}</div>
      {item.description && (
        <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
          {item.description}
        </p>
      )}
    </Link>
  );
};

export { Navbar };
