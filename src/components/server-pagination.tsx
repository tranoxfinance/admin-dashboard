import Link from "next/link";
import type { Dict } from "@/lib/i18n";

export function ServerPagination({
  dict,
  page,
  pageCount,
  hrefFor,
}: {
  dict: Dict;
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) {
    return null;
  }
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">
        {dict.common.pageOf(page, pageCount)}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            className="rounded-md border px-3 py-1.5 font-medium hover:bg-muted"
          >
            {dict.common.previous}
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link
            href={hrefFor(page + 1)}
            className="rounded-md border px-3 py-1.5 font-medium hover:bg-muted"
          >
            {dict.common.next}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
