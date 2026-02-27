"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { oAuthProviderNames } from "@/constants/oauth";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Logo } from "./Logo";
import { ModeSelect } from "./ModeSelect";

interface MenuItem {
  label: string;
  url: string;
}

const Navbar = () => {
  const { user, status, signOutUser } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const publicMenu: MenuItem[] = [
    {
      label: "About",
      url: "/about",
    },
  ];
  const authenticatedMenu: MenuItem[] = [
    {
      label: "Practice",
      url: "/practice",
    },
    {
      label: "History",
      url: "/history",
    },
  ];

  const navbarMenu =
    status === "authenticated"
      ? [...publicMenu, ...authenticatedMenu]
      : publicMenu;

  return (
    <nav>
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex w-full items-center sm:hidden">
            {/* Mobile Menu */}
            <div className="flex w-full items-center">
              <div className="flex-1" />
              <Link href="/" className="shrink-0">
                <Logo />
              </Link>
              <div className="flex flex-1 items-center justify-end gap-2">
                <ModeSelect />
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="aspect-square border-input shadow-none hover:bg-card hover:text-card-foreground dark:bg-transparent dark:hover:bg-card"
                    >
                      <Menu className="size-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Flow Into Code</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-6 p-4">
                      <div className="flex w-full flex-col gap-1">
                        {navbarMenu.map((item) =>
                          renderMobileMenuItem(item, pathname, () => setMobileOpen(false)),
                        )}
                      </div>

                      <Separator />

                      <div className="flex flex-col gap-3">
                        {status === "authenticated" ? (
                          <div>
                            <div className="flex items-center gap-4">
                              <Avatar className="h-9 w-9">
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
                              <div>
                                <div className="text-lg font-semibold">
                                  {user?.displayName || "User"}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                  {user?.email || "No email available"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-col">
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={signOutUser}
                              >
                                Sign Out
                              </Button>
                              <p className="text-muted-foreground mt-1.5 text-xs">
                                Signed in via{" "}
                                <span className="font-medium">
                                  {
                                    oAuthProviderNames[
                                      user?.providerData[0]?.providerId ||
                                        "unknown"
                                    ]
                                  }
                                </span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Button asChild variant="outline" className="w-full">
                            <Link href="/signin">Sign In</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden w-full items-center justify-between sm:flex">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/" className="shrink-0">
                <Logo />
              </Link>
              <NavigationMenu viewport={false} className="mt-1">
                <NavigationMenuList>
                  {navbarMenu.map((item) => renderMenuItem(item, pathname))}
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
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={signOutUser}
                      >
                        Sign Out
                      </Button>
                      <p className="text-muted-foreground mt-1.5 text-xs">
                        Signed in via{" "}
                        <span className="font-medium">
                          {
                            oAuthProviderNames[
                              user?.providerData[0]?.providerId || "unknown"
                            ]
                          }
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
const renderMenuItem = (item: MenuItem, pathname: string) => {
  const isActive = pathname.startsWith(item.url);

  return (
    <NavigationMenuItem key={item.label}>
      <Link
        href={item.url}
        className={cn(
          "inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none",
          "underline-offset-6 hover:underline",
          isActive && "underline",
        )}
      >
        {item.label}
      </Link>
    </NavigationMenuItem>
  );
};

// Mobile Menu
const renderMobileMenuItem = (item: MenuItem, pathname: string, onClose: () => void) => {
  const isActive = pathname.startsWith(item.url);

  return (
    <Link
      key={item.label}
      href={item.url}
      onClick={onClose}
      className={cn(
        "text-md focus-visible:border-ring focus-visible:ring-ring/50 block rounded-md p-3 leading-none font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:outline-none",
        "underline-offset-4 hover:underline",
        isActive && "underline",
      )}
    >
      {item.label}
    </Link>
  );
};

export { Navbar };
