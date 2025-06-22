"use client"
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import type { Event, Team } from "@/lib/types"
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"

const NavLink = ({ href, children, hasDropdown }: { href?: string; children: React.ReactNode; hasDropdown?: boolean }) => {
  const content = (
    <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-300 py-2">
      <span>{children}</span>
      {hasDropdown && <ChevronDown className="h-4 w-4" />}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

interface EventHeaderProps {
  event: Event
  team1: Team | null
  team2: Team | null
}

export function EventHeader({ event, team1, team2 }: EventHeaderProps) {
  const team1Logo = team1?.logo || "/placeholder-logo.svg"
  const team2Logo = team2?.logo || "/placeholder-logo.svg"

  return (
    <div className="bg-[#070F40] py-12 px-4 md:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-center">
          <div className="flex items-center gap-4">
            <Image
              src={team1Logo}
              alt={team1?.team_name || "Team 1"}
              width={104}
              height={104}
              className="object-contain"
            />
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold">
                {team1?.team_name}
              </h2>
              {/* <p className="text-sm opacity-70">7 vieta A lygoje</p> */}
            </div>
          </div>

          <div className="text-5xl md:text-8xl font-extrabold">-</div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <h2 className="text-3xl md:text-4xl font-bold">
                {team2?.team_name}
              </h2>
              {/* <p className="text-sm opacity-70">1 vieta A lygoje</p> */}
            </div>
            <Image
              src={team2Logo}
              alt={team2?.team_name || "Team 2"}
              width={104}
              height={104}
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mt-8 text-lg">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-main-orange" />
            <span>
              {new Date(event.date).toLocaleDateString("lt-LT", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-main-orange" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-6 h-6 text-main-orange" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const SiteHeader = () => {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-[#0A165B] text-white font-medium">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image src="https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/team-logo//Banga.png" alt="Banga" width={40} height={40} />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <NavLink href="https://darkorange-partridge-697021.hostingersite.com/klubas/">KLUBAS</NavLink>
            <NavLink href="https://darkorange-partridge-697021.hostingersite.com/naujienos/">NAUJIENOS</NavLink>
            <NavLink href="https://darkorange-partridge-697021.hostingersite.com/komandos/" hasDropdown>KOMANDOS</NavLink>
            <NavLink href="https://darkorange-partridge-697021.hostingersite.com/varzybu-bilietai/">VARŽYBŲ BILIETAI</NavLink>
            <NavLink href="https://darkorange-partridge-697021.hostingersite.com/pamaina/">PAMAINA</NavLink>
            <NavLink href="https://darkorange-partridge-697021.hostingersite.com/shop/">SHOP</NavLink>
            <NavLink href="https://darkorange-partridge-697021.hostingersite.com/kontaktai/">KONTAKTAI</NavLink>
          </nav>
          <div className="flex items-center space-x-4">
            <Search className="h-5 w-5 cursor-pointer hover:text-gray-300" />
            <Link href="/checkout" className="relative cursor-pointer hover:text-gray-300">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-[#F15601] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">{totalItems}</span>
            </Link>
            <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-300">
              <span>LT</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader; 