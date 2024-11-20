"use client";

import {
  deleteBinMaterial,
  getAllBinsWithMaterial,
} from "@/app/action/binMaterial";
import { toast } from "@/hooks/use-toast";
import { BinMaterial } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { useEffect, useState } from "react";

const MaterialActions = ({ material }: { material: BinMaterial }) => {
  const router = useRouter();
  const datetime = new Date().toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    hour12: false, // 24-hour format, remove if 12-hour format is needed
  });
  const [hasBins, setHasBins] = useState(false);
  useEffect(() => {
    const getAllBinsByManager = async () => {
      const result = await getAllBinsWithMaterial(material.id);
      setHasBins(result.length > 0);
    };
    getAllBinsByManager();
  }, [material.id]);
  const onDelete = async (id: string) => {
    const result = await deleteBinMaterial(id);
    if (result?.success) {
      toast({
        title: "Material type deleted successfully",
        description: (
          <div>
            Material deleted at {datetime}
            <br />
            <br />
            <strong>Material ID: </strong> {id}
          </div>
        ),
        duration: 2000,
        variant: "default",
      });
      router.refresh();
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/admin/bin/material/update/${material.id}`} passHref>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DropdownMenuItem
                onClick={() => onDelete(material.id)}
                className={hasBins ? "cursor-not-allowed opacity-50" : ""}
                disabled={hasBins}
              >
                Delete
              </DropdownMenuItem>
            </div>
          </TooltipTrigger>
          {hasBins && (
            <TooltipContent
              side="bottom"
              align="center"
              className="bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg shadow-lg max-w-xs"
            >
              <div className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-gray-800">Warning</p>
                  <p className="mt-1 text-sm">
                    This material type is in use. Deleting is not allowed.
                  </p>
                </div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<BinMaterial>[] = [
  {
    accessorKey: "name",
    header: "Material",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => <MaterialActions material={row.original} />,
  },
];
