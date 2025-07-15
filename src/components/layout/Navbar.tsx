"use client";

import { Menu } from "lucide-react";
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
  // TODO: Insert useAuth hook here for authentication state

  const publicMenu: MenuItem[] = [
    {
      label: "Problems",
      url: "/problems",
      items: [
        {
          label: "LeetCode",
          description: "Explore problems from LeetCode",
          url: "/problems/leetcode",
        },
        {
          label: "HackerRank",
          description: "Explore problems from HackerRank",
          url: "/problems/hackerrank",
        },
        {
          label: "Custom",
          description: "Define and practice your own problems",
          url: "/problems/custom",
        },
      ],
    },
    {
      label: "Practice",
      url: "/practice",
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
  ];
  const navbarMenu = [...publicMenu, ...authenticatedMenu];

  return (
    <nav>
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex w-full items-center sm:hidden">
            {/* Mobile Menu */}
            <div className="flex w-full items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-tighter">
                  LOGO
                </span>
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
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

                    <div className="flex flex-col gap-3">
                      <Button asChild variant="outline">
                        <a href="#">Login</a>
                      </Button>
                      <Button asChild>
                        <a href="#">Sign Up</a>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden w-full items-center justify-between sm:flex">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-tighter">
                  LOGO
                </span>
              </Link>
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  {navbarMenu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="#">Login</a>
              </Button>
              <Button asChild size="sm">
                <a href="#">Sign Up</a>
              </Button>
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
