"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/hooks/use-sidebar-state";
import { AppSidebar } from "./app-sidebar";
import { TopNavbar } from "./top-navbar";
import { logout } from "@/actions/auth";

interface AdminShellProps {
  children: ReactNode;
  userName: string;
  userEmail?: string;
}

export function AdminShell({ children, userName, userEmail }: AdminShellProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#F8F8F5]">
        <AppSidebar userName={userName} onSignOut={handleSignOut} />
        <div className="flex flex-1 flex-col min-w-0">
          <TopNavbar userName={userName} userEmail={userEmail} onSignOut={handleSignOut} />
          <main className="flex-1 px-6 pb-10 pt-6 lg:px-8 lg:pt-8">
            <div className="mx-auto max-w-[1440px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
