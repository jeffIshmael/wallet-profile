"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "bg-void-surface border border-white/10 text-white shadow-lg",
          title: "text-white",
          description: "text-stardust"
        }
      }}
    />
  );
}
