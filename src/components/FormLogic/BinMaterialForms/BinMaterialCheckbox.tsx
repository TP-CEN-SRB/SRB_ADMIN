"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { BinMaterial } from "@/generated/prisma"
import { ControllerRenderProps } from "react-hook-form";

interface BinMaterialCheckBoxProps {
  materials: BinMaterial[];
  usedBinMaterials: { id: string; name: string }[];
  // Use the generic type: ControllerRenderProps<FormValues, FieldName>
  field: ControllerRenderProps<any, "materialIds">; 
}

const BinMaterialCheckBox = ({
  materials,
  field,
  usedBinMaterials,
}: BinMaterialCheckBoxProps) => {
  const checkUsedMaterials = (materialId: string) => {
    const usedMaterial = usedBinMaterials.some(
      (usedMaterial) => usedMaterial.id === materialId
    )
    return usedMaterial
  }
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
              )
            }}
          />
          {checkUsedMaterials(material.id) ? <label className="line-through">{material.name}</label> : <label>{material.name}</label>}
        </div>
      ))}
    </div>
  )
}

export default BinMaterialCheckBox
