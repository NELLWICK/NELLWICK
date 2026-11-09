import "./globals.css";
import "./store-pages.css";
import "./nellwick-cart-actions.css";
import "./home.css";
import Preloader from "@/components/Preloader";
import SmoothExperience from "@/components/SmoothExperience";
import { CartProvider } from "@/components/CartProvider";

export const metadata = {
  title: "NELLWICK | Thoughtful Pet Essentials",
  description:
    "Thoughtful grooming and care essentials for everyday life with pets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SmoothExperience>
          <CartProvider>
            <Preloader />
            {children}
          </CartProvider>
        </SmoothExperience>
      </body>
    </html>
  );
}
