import { useState } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const displayed = items.slice(0, page * pageSize);
  const hasMore = displayed.length < items.length;

  const loadMore = () => {
    if (hasMore) setPage((p) => p + 1);
  };

  const reset = () => setPage(1);

  return { displayed, hasMore, loadMore, reset, page };
}