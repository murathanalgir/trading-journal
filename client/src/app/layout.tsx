// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Trading Journal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          {/* <Navbar/> */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
