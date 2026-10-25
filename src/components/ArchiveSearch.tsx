import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ArchiveSearchProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export const ArchiveSearch = ({ onSearch, placeholder = "Sök bland artiklar och rapporter..." }: ArchiveSearchProps) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), 350);
    return () => clearTimeout(t);
  }, [value, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Sök i arkivet"
        className="pl-9 pr-10 h-11"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={() => setValue("")}
          aria-label="Rensa sökning"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
