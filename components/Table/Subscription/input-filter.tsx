import { Input } from "@/components/ui/input";
import React from "react";
interface InputFilterProps {
  onSearch: (e: string) => void;
  query: string | null;
}
const InputFilter = ({ onSearch, query }: InputFilterProps) => {
  return (
    <Input
      type="search"
      defaultValue={encodeURIComponent(query ?? "")}
      onChange={(e) => {
        onSearch(e.target.value ?? "");
      }}
      placeholder="Filter students..."
      className="max-w-xs"
    />
  );
};

export default InputFilter;
