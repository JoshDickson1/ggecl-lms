import React from "react";

export function InputBox({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col p-1 gap-2 relative transition-[height] duration-500">
      {children}
    </section>
  );
}
