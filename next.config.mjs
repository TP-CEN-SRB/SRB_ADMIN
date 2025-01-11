// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         port: "",
//         hostname: "utfs.io",
//         pathname: "/**",
//       },
//       {
//         protocol: "https",
//         port: "",
//         hostname: "bkrvneb21d.ufs.sh",
//         pathname: "/**",
//       },
//     ],
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
