import withNextIntl from "next-intl/plugin"

const withNextIntlConfig = withNextIntl()

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
}

export default withNextIntlConfig(nextConfig)