"use client";

import { ControllerRenderProps } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { BinMaterial } from "@prisma/client";
import { z } from "zod";
import { BinMaterialSchema } from "@/schemas";
import { useState } from "react";

interface BinMaterialCheckBoxProps {
  materials: BinMaterial[]; // Array of material strings
  field: ControllerRenderProps<
    {
      location: string;
      status: "FUNCTIONAL" | "UNDER_MAINTENANCE";
      materialIds: [string, ...string[]];
    },
    "materialIds"
  >;
  usedBinMaterials: { id: string; name: string }[]; // React Hook Form field prop
}

const BinMaterialCheckBox = ({
  materials,
  field,
  usedBinMaterials,
}: BinMaterialCheckBoxProps) => {
  const checkUsedMaterials = (materialId: string) => {
    const usedMaterial = usedBinMaterials.some(
      (usedMaterial) => usedMaterial.id === materialId
    );
    return usedMaterial;
  };
  return (
    <div>
      {materials.map((material, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            disabled={checkUsedMaterials(material.id)}
            checked={field.value?.includes(material.id)}
            onCheckedChange={(checked) => {
              // Update the value array in the field
              field.onChange(
                checked
                  ? [...(field.value || []), material.id]
                  : field.value?.filter(
                      (value: string) => value !== material.id
                    )
              );
            }}
          />
          <label>{material.name}</label>
        </div>
      ))}
    </div>
  );
};

export default BinMaterialCheckBox;
