import { ReactNode } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LucideCheckCircle } from "lucide-react";
interface FormMessageProps {
  children: ReactNode;
  type: "Error" | "Success";
}
const CustomFormMessage = ({ children, type }: FormMessageProps) => {
  return (
    <Alert
      className={`border ${
        type === "Error"
          ? "bg-destructive/15 text-destructive border-destructive "
          : "bg-emerald-500/15 text-emerald-500 border-emerald-500"
      }`}
    >
      <AlertTitle className="font-bold">
        <div className="flex items-center gap-x-2">
          {type === "Error" ? <FaExclamationTriangle /> : <LucideCheckCircle />}
          {type}
        </div>
      </AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
};

export default CustomFormMessage;
