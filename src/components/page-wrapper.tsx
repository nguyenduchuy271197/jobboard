import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full";
  spacing?: "sm" | "md" | "lg";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  full: "max-w-full",
};

const spacingClasses = {
  sm: "space-y-4",
  md: "space-y-6",
  lg: "space-y-8",
};

export function PageWrapper({
  children,
  className,
  maxWidth = "full",
  spacing = "md",
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 py-6",
        maxWidthClasses[maxWidth],
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </div>
  );
}

// Specific wrapper for dashboard pages
export function DashboardPageWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
