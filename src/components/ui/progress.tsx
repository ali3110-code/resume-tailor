"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full transition-all rounded-full"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          background: "linear-gradient(to right, #06b6d4, #6366f1, #a855f7)",
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
