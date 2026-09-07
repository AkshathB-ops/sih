import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Jharkhand Innovation Collaboration Portal",
  description:
    "Convert real societal challenges in Jharkhand into validated, institutionally matched and collaboratively developed solutions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          {children}
          <footer className="mt-auto border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
            <p>Societal Innovation Collaboration Portal · Jharkhand</p>
          </footer>
        </div>
      </body>
    </html>
  );
}