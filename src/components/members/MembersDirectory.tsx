"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MemberCard } from "@/components/members/MemberCard";
import { Button } from "@/components/ui/Button";
import { members } from "@/lib/data";

export function MembersDirectory() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string>("All");

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(members.map((m) => m.industry))).sort()],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesQuery =
        q === "" ||
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q);
      const matchesIndustry = industry === "All" || m.industry === industry;
      return matchesQuery && matchesIndustry;
    });
  }, [query, industry]);

  const resetFilters = () => {
    setQuery("");
    setIndustry("All");
  };

  if (members.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 px-6 py-20 text-center">
        <p className="font-display text-lg font-semibold tracking-tight text-ink">
          The directory is just getting started
        </p>
        <p className="max-w-md text-sm leading-relaxed text-slate">
          As founding members join, they&rsquo;ll appear here — with what
          they&rsquo;re building and a way to ask for a warm introduction.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company, or city"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 pl-10 text-sm text-ink placeholder:text-faint focus-ring transition-colors sm:w-72"
            aria-label="Search members"
          />
        </div>

        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-faint focus-ring transition-colors sm:w-auto"
          aria-label="Filter by industry"
        >
          {industries.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "All" ? "All industries" : opt}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-4 text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? "member" : "members"}
      </p>

      {filtered.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-4 px-6 py-16 text-center">
          <p className="text-sm text-muted">No members match your filters.</p>
          <Button onClick={resetFilters} variant="secondary" size="sm">
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MemberCard key={m.id} member={m} href={`/members/${m.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
