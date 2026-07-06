import type { Metadata } from "next";
import Sidebar from "./components/sidebar";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trip Planner",
  description: "Plan your next adventure",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">
        <Sidebar />
        <Navbar />
        <div className="ml-280px mt-16 p-8">
          {children}
        </div>
      </body>
    </html>
  );
}