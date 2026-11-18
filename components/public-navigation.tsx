"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, ChevronDown, Clock3 } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Match } from "@/lib/types";

/** True when `pathname` is one of `paths` or below it (`/zaidejai/12` matches `/zaidejai`). */
function matchesPath(pathname: string, paths: string[]) {
  return paths.some((path) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function PublicNavigation() {
  const pathname = usePathname();
  const isActive = (paths: string[]) => matchesPath(pathname, paths);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const { cart } = useCart();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    async function fetchUpcomingMatch() {
      try {
        const response = await fetch("/api/matches/upcoming");
        if (response.ok) {
          const data = await response.json();
          setUpcomingMatch(data);
        }
      } catch (error) {
        console.error("Failed to fetch upcoming match:", error);
      }
    }

    fetchUpcomingMatch();
  }, []);

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "sausio",
      "vasario",
      "kovo",
      "balandžio",
      "gegužės",
      "birželio",
      "liepos",
      "rugpjūčio",
      "rugsėjo",
      "spalio",
      "lapkričio",
      "gruodžio",
    ];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const formatMatchTime = (timeString: string) => {
    return timeString?.substring(0, 5) || "";
  };

  const navigationItems = [
    { href: "/", label: "Pradžia", page: "home", paths: ["/"] },
    { href: "/klubas", label: "Klubas", page: "klubas", paths: ["/klubas"] },
    { href: "/naujienos", label: "Naujienos", page: "naujienos", paths: ["/naujienos"] },
    {
      label: "Komandos",
      page: "komandos",
      paths: ["/zaidejai", "/players"],
      dropdown: true,
      items: [
        { href: "/zaidejai?team=BANGA A", label: "Banga A", page: "zaidejai-a", paths: ["/zaidejai", "/players"] },
        { href: "/zaidejai?team=BANGA B", label: "Banga B", page: "zaidejai-b", paths: ["/zaidejai", "/players"] },
        { href: "/zaidejai?team=BANGA M", label: "Banga M", page: "zaidejai-m", paths: ["/zaidejai", "/players"] },
      ],
    },
    {
      label: "Bilietai ir abonementai",
      page: "tickets-subscriptions",
      paths: ["/renginiai", "/event", "/prenumeratos", "/subscriptions", "/tickets", "/bilietai"],
      dropdown: true,
      items: [
        { href: "/renginiai", label: "Bilietai", page: "renginiai", paths: ["/renginiai", "/event"] },
        { href: "/prenumeratos", label: "Abonementai", page: "prenumeratos", paths: ["/prenumeratos", "/subscriptions"] },
      ],
    },
    { href: "/pamaina", label: "Akademija", page: "pamaina", paths: ["/pamaina"] },
    { href: "/parduotuve", label: "Parduotuvė", page: "parduotuve", paths: ["/parduotuve", "/shop"] },
    { href: "/kontaktai", label: "Kontaktai", page: "kontaktai", paths: ["/kontaktai", "/contact"] },
  ];

  return (
    <>
      {/* Top subnavigation (match info) */}
      <div className="bg-surface-deep sticky top-0 z-50">
        <div className="border-b border-[rgba(95,95,113,0.3)] bg-gradient-to-b from-surface-deep/80 to-transparent">
          <div className="w-full px-4 md:px-8 lg:px-16 h-10 flex items-center justify-between">
            {/* Left: date and time */}
            <div className="flex items-center gap-2 text-primary text-sm">
              <Clock3 className="h-4 w-4" />
              {upcomingMatch ? (
                <span>
                  {formatMatchDate(upcomingMatch.match_date!)},{" "}
                  {formatMatchTime(upcomingMatch.match_time!)}
                </span>
              ) : (
                <span>Nėra artimiausių rungtynių</span>
              )}
            </div>

            {/* Center: teams */}
            <div className="hidden md:flex items-center gap-2 text-white text-sm">
              {upcomingMatch ? (
                <>
                  <span>{upcomingMatch.team1}</span>
                  <span>-</span>
                  <span>{upcomingMatch.team2}</span>
                </>
              ) : (
                <span>Banga</span>
              )}
            </div>

            {/* Right: stadium */}
            <div className="text-xs md:text-sm text-white/60">
              {upcomingMatch?.venue || 'FK „Žalgiris" namų stadionas'}
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="bg-background border-b border-[rgba(95,95,113,0.3)] h-[72px] flex items-center">
          <div className="w-full px-4 md:px-8 lg:px-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/banga-logo.svg"
                  alt="FK Banga"
                  width={56}
                  height={56}
                  priority
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                if (item.dropdown) {
                  return (
                    <DropdownMenu key={item.page}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`flex items-center gap-1 transition-colors bg-transparent hover:bg-transparent focus:bg-transparent rounded-none ${
                            isActive(item.paths)
                              ? "text-primary border-b-2 border-primary"
                              : "text-white hover:text-primary hover:border-b-2 hover:border-primary"
                          }`}
                        >
                          {item.label}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-background border-surface rounded-none">
                        {item.items?.map((dropdownItem) => (
                          <DropdownMenuItem
                            key={dropdownItem.href}
                            className="rounded-none hover:bg-transparent focus:bg-transparent"
                          >
                            <Link
                              href={dropdownItem.href || "#"}
                              className="text-white hover:text-primary w-full"
                            >
                              {dropdownItem.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href || "#"}
                    className={`transition-colors ${
                      isActive(item.paths)
                        ? "text-primary border-b-2 border-primary"
                        : "text-white hover:text-primary hover:border-b-2 hover:border-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Shopping Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartSheetOpen(true)}
                className="relative text-white hover:bg-white/10"
              >
                <ShoppingCart className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </div>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-4">
              {/* Shopping Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartSheetOpen(true)}
                className="relative text-white hover:bg-white/10"
              >
                <ShoppingCart className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </div>
              </Button>

              {/* Hamburger Menu */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-white hover:bg-white/10"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent className="bg-background text-white border-surface w-[300px] p-0">
          <SheetHeader className="border-b border-surface p-4">
            <SheetTitle className="text-white text-xl font-bold text-left">
              Meniu
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col p-4 space-y-2">
            {navigationItems.map((item) => {
              if (item.dropdown) {
                return (
                  <div key={item.page} className="space-y-2">
                    <div className="text-lg py-3 px-4 text-white font-semibold">
                      {item.label}
                    </div>
                    {item.items?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.href}
                        href={dropdownItem.href || "#"}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-base py-2 px-8 transition-colors ${
                          isActive(dropdownItem.paths)
                            ? "text-primary border-l-2 border-primary"
                            : "text-white hover:text-primary hover:border-l-2 hover:border-primary"
                        }`}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href || "#"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg py-3 px-4 transition-colors ${
                    isActive(item.paths)
                      ? "text-primary border-l-2 border-primary"
                      : "text-white hover:text-primary hover:border-l-2 hover:border-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cart Sheet */}
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />
    </>
  );
}
