import { BriefcaseIcon } from "lucide-react";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <BriefcaseIcon className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold">JobBoard</span>
    </Link>
  );
}
