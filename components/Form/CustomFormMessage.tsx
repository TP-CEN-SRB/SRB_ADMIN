import { ReactNode } from "react";
import { LuCheckCircle } from "react-icons/lu";
import { FaExclamationTriangle } from "react-icons/fa";
interface FormMessageProps {
  children: ReactNode;
  type: "Error" | "Success";
}
const CustomFormMessage = ({ children, type }: FormMessageProps) => {
  return (
    <div
      className={`${
        type === "Error"
          ? "bg-destructive/15 text-destructive p-3"
          : "bg-emerald-500/15 text-emerald-500"
      } rounded-md flex items-center gap-x-2 text-sm`}
    >
      {type === "Error" ? <FaExclamationTriangle /> : <LuCheckCircle />}
      <p>{children}</p>
    </div>
  );
};

export default CustomFormMessage;
