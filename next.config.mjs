/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        port: "",
        hostname: "utfs.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
