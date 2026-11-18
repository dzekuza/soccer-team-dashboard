import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A package-lock.json exists in the parent projects/ folder; pin the root here.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Kept on: CMS content references many remote hosts. Enabling the optimizer
    // needs an `images.remotePatterns` allow-list first. Until then, ship
    // right-sized assets (see public/landing).
    unoptimized: true,
  },
}

export default nextConfig
