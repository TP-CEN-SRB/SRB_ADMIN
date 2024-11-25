import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full text-sm rounded-md border border-neutral-200 bg-white px-3 py-2 resize-none ring-offset-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 outline-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
