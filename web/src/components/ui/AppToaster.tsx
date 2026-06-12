"use client";

import { createElement } from "react";
import { Toaster } from "sonner";

export function AppToaster() {
  return createElement(Toaster, {
    theme: "dark",
    position: "bottom-center",
    richColors: true,
    closeButton: true,
    toastOptions: {
      classNames: {
        toast: "bg-void-surface border border-white/10 text-white shadow-lg",
        title: "text-white",
        description: "text-stardust"
      }
    }
  });
}
