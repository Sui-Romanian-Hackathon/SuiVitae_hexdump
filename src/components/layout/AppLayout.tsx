import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b-2 border-border bg-background px-4 md:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="border-2 border-border p-2 hover:bg-accent hover:shadow-xs" />
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses, certifications..."
                  className="w-80 border-2 pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="border-2 border-border hover:shadow-xs">
                <Bell className="h-5 w-5" />
              </Button>
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-secondary/30 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
