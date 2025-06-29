import { BriefcaseIcon } from "lucide-react";
import Link from "next/link";

export default function Logo({ onlyIcon = false }: { onlyIcon: boolean }) {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <BriefcaseIcon className="h-6 w-6 text-primary" />
      {!onlyIcon && <span className="text-xl font-bold">JobBoard</span>}
    </Link>
  );
}
