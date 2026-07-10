"use client";

import { useState } from "react";

export function InfoPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-ink-dim hover:text-ink transition"
      >
        Info
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-3 w-64 rounded-md border border-line bg-bg p-4 text-xs normal-case leading-relaxed tracking-normal text-ink-dim shadow-sm">
          <p>
            A non-commercial study archive of notable digital ad campaigns
            from the last ~2 years. Creative belongs to the respective
            brands and is republished here for commentary and reference.
          </p>
          <p className="mt-3 font-mono-tag uppercase text-ink">
            Sourced by an automated research pipeline
          </p>
        </div>
      )}
    </div>
  );
}
