import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern, much-smaller formats when the browser supports them.
    formats: ["image/avif", "image/webp"],
    // Product image URLs are content-addressed (random filenames), so optimized
    // variants can be cached at the edge for a long time.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
