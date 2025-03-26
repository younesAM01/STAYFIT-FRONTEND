/** @type {import('next').NextConfig} */
import withVideos from 'next-videos';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig = {images: {
  domains: ['static.vecteezy.com']
}};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withVideos(nextConfig));

