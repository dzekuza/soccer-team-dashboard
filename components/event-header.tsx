import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Search, ShoppingBag } from 'lucide-react';

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
  return (
    <header className="bg-[#0A165B] text-white font-medium">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {/* Using a placeholder as the logo from figma seems to be for a specific team */}
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            </Link>
          </div>
          <nav className="hidden lg:flex lg:items-center lg:space-x-6 text-sm">
            <NavLink hasDropdown>Klubas</NavLink>
            <NavLink href="/news">Naujienos</NavLink>
            <NavLink hasDropdown>Komandos</NavLink>
            <NavLink hasDropdown>Bilietai</NavLink>
            <NavLink href="/academy">Akademija</NavLink>
            <NavLink href="/store">Parduotuvė</NavLink>
            <NavLink href="/contact">Kontaktai</NavLink>
          </nav>
          <div className="flex items-center space-x-4">
            <Search className="h-5 w-5 cursor-pointer hover:text-gray-300" />
            <div className="relative cursor-pointer hover:text-gray-300">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-[#F15601] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">0</span>
            </div>
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