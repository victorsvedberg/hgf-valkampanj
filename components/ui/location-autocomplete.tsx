"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { MapPin, Search } from "lucide-react";

interface LocationResult {
  type: "postnummer" | "ort";
  display: string;
  ort: string;
  kommun: string;
  kommunKod: string;
  lan: string;
  postnummer?: string;
}

interface LocationAutocompleteProps {
  onSelect: (result: LocationResult) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
}

export function LocationAutocomplete({
  onSelect,
  placeholder = "Sök ort eller postnummer...",
  label,
  hint,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search-location?q=${encodeURIComponent(query)}&limit=8`
        );
        const data = await response.json();
        setResults(data.results);
        setIsOpen(data.results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: LocationResult) => {
    setQuery(result.display);
    setIsOpen(false);
    onSelect(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          label={label}
          hint={hint}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-hgf-blue/30 border-t-hgf-blue rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-hgf-black/30" />
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-hgf-neutral rounded-lg shadow-lg overflow-hidden">
          <ul className="py-1 max-h-64 overflow-auto">
            {results.map((result, index) => (
              <li key={`${result.type}-${result.postnummer || result.ort}-${index}`}>
                <button
                  type="button"
                  className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                    index === selectedIndex
                      ? "bg-hgf-bg-light-blue"
                      : "hover:bg-hgf-neutral/30"
                  }`}
                  onClick={() => handleSelect(result)}
                >
                  <MapPin className="w-4 h-4 text-hgf-blue mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-hgf-black truncate">
                      {result.display}
                    </div>
                    <div className="text-sm text-hgf-black/60 truncate">
                      {result.kommun} · {result.lan}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
