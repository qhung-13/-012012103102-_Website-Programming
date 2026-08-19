"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const [value, setValue] = useState(currentSearch);

  useEffect(() => setValue(currentSearch), [currentSearch]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(`/products${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="hidden sm:flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 focus-within:border-gold-dark transition-colors"
    >
      <Search className="w-4 h-4 text-muted" aria-hidden="true" />
      <label htmlFor="site-search" className="sr-only">
        Tìm sản phẩm
      </label>
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tìm sản phẩm..."
        className="text-sm outline-none placeholder:text-muted w-28 lg:w-44"
      />
    </form>
  );
};

export default SearchBar;
