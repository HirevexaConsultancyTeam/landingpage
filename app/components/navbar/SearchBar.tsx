"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="hidden lg:flex flex-1 max-w-3xl mx-8">

      <input
        placeholder="Search jobs..."
        className="flex-1 px-4 py-2 rounded-l text-black outline-none"
      />

      <button className="bg-[#FF9900] px-5 rounded-r">

        <Search className="text-[#131921]" />

      </button>

    </div>
  );
}