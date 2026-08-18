import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InlineStatus } from "@/hooks/useInlineStatus";

interface StatusButtonProps extends ButtonProps {
  status: InlineStatus;
  idleLabel: string;
  successLabel?: string;
}

export const StatusButton = ({ status, idleLabel, successLabel = "Saved", className, disabled, ...props }: StatusButtonProps) => {
  const isSuccess = status === "success";
  const isLoading = status === "loading";

  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        isSuccess && "bg-emerald-500 hover:bg-emerald-500 border-emerald-500 text-white",
        className,
      )}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {isSuccess && <Check className="w-4 h-4" />}
      {isSuccess ? successLabel : idleLabel}
    </Button>
  );
};
