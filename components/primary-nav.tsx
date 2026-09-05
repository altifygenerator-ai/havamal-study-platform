"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  ["/havamal", "Texts"],
  ["/editions", "Editions"],
  ["/themes", "Themes"],
  ["/compare", "Compare"],
  ["/study", "Study"],
  ["/discuss", "Discussion"],
  ["/quote-maker", "Quote maker"],
] as const;

function isCurrent(pathname: string, href: string) {
  if (href === "/havamal") return pathname === href || pathname.startsWith("/havamal/");
  if (href === "/editions") {
    return pathname === href || pathname.startsWith("/editions/") || pathname.startsWith("/translators/");
  }
  if (href === "/study") return pathname === href || pathname.startsWith("/study/");
  if (href === "/discuss") return pathname === href || pathname.startsWith("/discuss/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav className="archive-nav" aria-label="Primary navigation">
      {navItems.map(([href, label], index) => {
        const current = isCurrent(pathname, href);
        return (
          <Link href={href} key={href} aria-current={current ? "page" : undefined}>
            <small>{String(index + 1).padStart(2, "0")}</small>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
