"use client";

import { useState } from "react";

export default function VideoModal({
  videoId,
  label = "Watch Introduction",
}: {
  videoId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10"
      >
        <span aria-hidden>▶</span> {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-3xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video max-h-[75vh] w-full overflow-hidden rounded-lg">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-3 rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-navy"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
