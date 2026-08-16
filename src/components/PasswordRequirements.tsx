import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirementsProps {
  password: string;
}

const requirements = [
  { label: "Minimum 8 characters", test: (p: string) => p.length >= 8 },
  { label: "1 uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "1 lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "1 number (0–9)", test: (p: string) => /[0-9]/.test(p) },
  { label: "1 special character (!@#$%^&*()-_=+[]{}|;:,.<>?)", test: (p: string) => /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(p) },
];

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  return (
    <div className="text-xs space-y-1 mt-2">
      <p className="font-medium text-muted-foreground">Password requirements:</p>
      <ul className="space-y-1 ml-1">
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <li
              key={index}
              className={cn(
                "flex items-center gap-1.5 transition-colors duration-200",
                isMet ? "text-green-500" : "text-destructive"
              )}
            >
              {isMet ? (
                <Check className="w-3 h-3 flex-shrink-0" />
              ) : (
                <X className="w-3 h-3 flex-shrink-0" />
              )}
              <span>{req.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
