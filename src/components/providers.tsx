"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="sahayata-theme"
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "var(--elev)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
          },
        }}
      />
    </ThemeProvider>
  );
}
