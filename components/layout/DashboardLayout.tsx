import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="workspace-shell min-h-screen">
      <a className="skip-link" href="#workspace-content">Skip to content</a>
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Navbar />
          <main id="workspace-content" className="workspace-content p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
