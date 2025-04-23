/** @type {import('next').NextConfig} */
import withVideos from 'next-videos';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig = {
    images: {
      domains: ["i.pinimg.com", "www.firstbeat.com ","static.vecteezy.com" , "t3.ftcdn.net" , "res.cloudinary.com"],
    },
  };

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withVideos(nextConfig));
