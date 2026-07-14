import {Search} from "lucide-react";
import {forwardRef, type InputHTMLAttributes} from "react";

import {Input} from "./input";
import {cn} from "@/lib/utils";

export const SearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({className, ...props}, ref) => (
    <div className="relative">
      <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Input ref={ref} type="search" className={cn("ps-9", className)} {...props} />
    </div>
  ),
);

SearchInput.displayName = "SearchInput";
