import { ReactNode } from "react";
import MainHeader from "./_components/main-header";
import MainFooter from "./_components/main-footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      {children}
      <MainFooter />
    </div>
  );
}
