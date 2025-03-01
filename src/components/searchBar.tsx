// src/components/SearchBar.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState<string>("");

    const handleSearch = () => {
        if (query.trim() !== "") {
            onSearch(query);
        }
    };

    return (
        <div className="flex mb-4">
            <Input
                type="text"
                placeholder="Search for a food..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow px-4 py-2 text-lg border rounded-md"
            />
            <Button
                type="submit"
                onClick={handleSearch}
                className="ml-2 px-6 py-2 text-lg"
            >
                Search
            </Button>
        </div>
    );
}

