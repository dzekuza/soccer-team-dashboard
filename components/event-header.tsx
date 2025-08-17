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
  return (
    <div className="w-full flex flex-col items-center justify-center bg-[rgba(7,15,64,0.70)] border border-[rgba(95,95,113,0.31)] py-8 px-4 mb-4" style={{ borderRadius: 0 }}>
      <div className="flex flex-row items-center justify-center gap-8 mb-4">
        {/* Team 1 */}
        <div className="flex flex-col items-center min-w-[100px]">
          <img src={team1?.logo || '/placeholder-logo.svg'} alt={team1?.team_name || 'Komanda 1'} className="object-contain w-20 h-20 mb-2" />
          <div className="text-white text-xl font-bold leading-tight">{team1?.team_name || 'Komanda 1'}</div>
        </div>
        {/* VS */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-extrabold text-white">VS</div>
        </div>
        {/* Team 2 */}
        <div className="flex flex-col items-center min-w-[100px]">
          <img src={team2?.logo || '/placeholder-logo.svg'} alt={team2?.team_name || 'Komanda 2'} className="object-contain w-20 h-20 mb-2" />
          <div className="text-white text-xl font-bold leading-tight">{team2?.team_name || 'Komanda 2'}</div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="text-white text-base font-semibold">{event.date} {event.time && <span className="ml-2">{event.time}</span>}</div>
        <div className="text-white/80 text-sm">{event.location}</div>
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
              <Image src="/Banga-1.png" alt="FK Banga" width={40} height={40} className="object-contain" />
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