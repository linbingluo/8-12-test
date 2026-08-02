import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import "leaflet/dist/leaflet.css";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="ml-[280px] mt-16 h-[calc(100vh-4rem)] overflow-y-auto p-8">{children}</div>
    </>
  );
}