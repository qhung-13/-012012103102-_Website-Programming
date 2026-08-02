import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="hidden sm:flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 focus-within:border-gold-dark transition-colors">
      <Search className="w-4 h-4 text-muted" />
      <input
        id="search"
        placeholder="Search products..."
        className="text-sm outline-none placeholder:text-muted w-36 lg:w-48"
      />
    </div>
  );
};

export default SearchBar;
