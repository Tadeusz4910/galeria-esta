import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pozwala testowac dev-server z telefonu w tej samej sieci LAN.
  // Bez tego Next.js blokuje zasoby dev (HMR + runtime klienta) z innego origin,
  // co psuje hydratacje i np. klikniecie hamburgera na telefonie.
  allowedDevOrigins: ['192.168.1.18'],
};

export default nextConfig;
