"use client";
import React from "react";

export function DarkOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black opacity-60 z-50 flex justify-center items-center">
      {children}
    </div>
  );
}
