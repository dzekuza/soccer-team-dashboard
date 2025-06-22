"use client"
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';

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

const EventHeader = () => {
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

export default EventHeader; 