"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Facebook, Instagram, Youtube } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-background text-white w-full border-t border-[rgba(95,95,113,0.3)]">
      {/* Main footer content */}
      <div className="w-full px-4 md:px-8 lg:px-16 py-6">
        {/* Desktop: 5-column grid */}
        <div className="hidden lg:grid grid-cols-5 gap-8">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/banga-logo.svg"
                alt="FK Banga"
                width={88}
                height={88}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Teams */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white/60 tracking-tight">
              Komandos
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/zaidejai?team=BANGA A"
                  className="text-white hover:text-primary transition-colors"
                >
                  Banga
                </Link>
              </li>
              <li>
                <Link
                  href="/zaidejai?team=BANGA B"
                  className="text-white hover:text-primary transition-colors"
                >
                  Banga B
                </Link>
              </li>
              <li>
                <Link
                  href="/zaidejai?team=BANGA M"
                  className="text-white hover:text-primary transition-colors"
                >
                  Merginos
                </Link>
              </li>
            </ul>
          </div>

          {/* Club */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white/60 tracking-tight">
              Klubas
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/naujienos"
                  className="text-white hover:text-primary transition-colors"
                >
                  Naujienos
                </Link>
              </li>
              <li>
                <Link
                  href="/tvarkarastis"
                  className="text-white hover:text-primary transition-colors"
                >
                  Tvarkaraštis
                </Link>
              </li>
              <li>
                <Link
                  href="/rezultatai"
                  className="text-white hover:text-primary transition-colors"
                >
                  Rezultatai
                </Link>
              </li>
              <li>
                <Link
                  href="/lentele"
                  className="text-white hover:text-primary transition-colors"
                >
                  Turnyrinė lentelė
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white/60 tracking-tight">
              Informacija
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/kontaktai"
                  className="text-white hover:text-primary transition-colors"
                >
                  Kontaktai
                </Link>
              </li>
              <li>
                <Link
                  href="/renginiai"
                  className="text-white hover:text-primary transition-colors"
                >
                  Bilietai
                </Link>
              </li>
              <li></li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white hover:text-primary transition-colors"
                >
                  Privatumo politika
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-white hover:text-primary transition-colors"
                >
                  Slapukų politika
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white/60 tracking-tight">
              Susisiekime
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="mailto:pavel@fkbanga.lt"
                  className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  pavel@fkbanga.lt
                </a>
              </li>
              <li>
                <a
                  href="tel:+37046452782"
                  className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  (8-46) 452782
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile: 2x1 grid */}
        <div className="lg:hidden grid grid-cols-1 gap-8">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/banga-logo.svg"
                alt="FK Banga"
                width={88}
                height={88}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Menu Grid - 2x1 Layout */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Teams */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/60 tracking-tight">
                  Komandos
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/zaidejai?team=BANGA A"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Banga
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/zaidejai?team=BANGA B"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Banga B
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/zaidejai?team=BANGA M"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Merginos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Club */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/60 tracking-tight">
                  Klubas
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/naujienos"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Naujienos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tvarkarastis"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Tvarkaraštis
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/rezultatai"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Rezultatai
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/lentele"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Turnyrinė lentelė
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/60 tracking-tight">
                  Informacija
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/kontaktai"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Kontaktai
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/renginiai"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Bilietai
                    </Link>
                  </li>
                  <li></li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Privatumo politika
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cookies"
                      className="text-white hover:text-primary transition-colors"
                    >
                      Slapukų politika
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/60 tracking-tight">
                  Susisiekime
                </h3>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="mailto:pavel@fkbanga.lt"
                      className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      pavel@fkbanga.lt
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+37046452782"
                      className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      (8-46) 452782
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-surface-deep border-t border-[rgba(95,95,113,0.35)] w-full">
        <div className="w-full px-4 md:px-8 lg:px-16 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-white text-base">
              © 2025 FK BANGA, Visos teisės saugomos.
            </div>

            {/* Social media */}
            <div className="flex items-center gap-6">
              <a
                href="https://facebook.com/fkbanga"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/fkbanga"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/fkbanga"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
