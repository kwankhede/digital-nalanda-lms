/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Stories live on the main Nalanda Academy blog now.
      { source: "/stories", destination: "https://nalanda-academy.org/nalanda-blog/", permanent: false },
      { source: "/stories/:slug*", destination: "https://nalanda-academy.org/nalanda-blog/", permanent: false },
    ];
  },
};

module.exports = nextConfig;
