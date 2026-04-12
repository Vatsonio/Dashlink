import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashlink",
  description: "Modern self-hosted dashboard. Auto-discover Docker services, health monitoring, 5 themes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          id="theme-fonts"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-base antialiased">
        {children}
      </body>
    </html>
  );
}
