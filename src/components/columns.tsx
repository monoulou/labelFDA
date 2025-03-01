import { createColumnHelper } from "@tanstack/react-table";
import type { FoodItem } from "@/api/usdaApi";

const columnHelper = createColumnHelper<FoodItem>(); // 👈 Use columnHelper

export const columns = [
    columnHelper.accessor("description", {
        header: "Description",
    }),
    columnHelper.accessor("foodCategory", {
        header: "Category",
    }),
    columnHelper.accessor("brandOwner", {
        header: "Brand Owner",
    }),
];

