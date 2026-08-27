import type { NextConfig } from "next";

function apiImagePattern() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    return {
      protocol: url.protocol === "https:" ? "https" : "http",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/**",
    } as const;
  } catch {
    return null;
  }
}

const apiPattern = apiImagePattern();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      ...(apiPattern ? [apiPattern] : []),
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;
