import { SideNav } from "@/components/side-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-[244px] shrink-0">
        <SideNav />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="container p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 