import './globals.css';
import { ShopProvider } from '../lib/store';

export const metadata = {
  title: 'Aurea — Minimal Clinical Skincare',
  description:
    'Aurea is a fictional minimal skincare brand. Demo portfolio site built with Next.js, Tailwind and GSAP.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ShopProvider>{children}</ShopProvider>
      </body>
    </html>
  );
}
