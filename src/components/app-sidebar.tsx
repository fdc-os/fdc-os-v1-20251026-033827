import { SidebarNav } from './layout/SidebarNav';
export function AppSidebar(): JSX.Element {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <div>
              <span className="text-lg font-bold">FDC OS</span>
              <p className="text-xs text-muted-foreground">Family Dental Clinic</p>
            </div>
          </a>
        </div>
        <SidebarNav />
      </div>
    </div>
  );
}