import {useEffect, useState, useMemo} from "react";
import { SearchBar } from "@/components/searchBar";
import { DataTable } from "@/components/dataTable";
import { NutritionLabelFDA } from "@/components/nutritionLabelFDA";
import { fetchFoodData, type FoodItem } from "@/api/usdaApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

// Household Measure Equivalents
const HOUSEHOLD_EQUIVALENTS: Record<string, number> = {
    "cup": 240,
    "tbsp": 15,
    "tsp": 5,
    "fl oz": 30,
    "oz": 28,
    "slice": 1,
    "gr/ml": 1,
};

function App() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const pageSize = 10;

    const handleSearch = async (query: string, pageNumber: number = 1) => {
        setSearchQuery(query);
        setPage(pageNumber);
        setLoading(true);
        setError(null);

        try {
            const data = await fetchFoodData(query, pageNumber, pageSize);
            setFoods(data);
        } catch (err) {
            setError("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const addFood = (food: FoodItem) => {
        setSelectedFoods((prev) => [...prev, food]);
    };

    const removeFood = (fdcId: number) => {
        setSelectedFoods((prev) => prev.filter((food) => food.fdcId !== fdcId));
    };


    const updateServingSize = (fdcId: number, newSize: number, unit: string) => {
        setSelectedFoods((prevFoods) =>
            prevFoods.map((food) =>
                food.fdcId === fdcId ? { ...food, servingSize: newSize, householdUnit: unit } : food
            )
        );
    };

    // ✅ Compute Total Serving Size in Grams (For Label Display)
    const totalServingSizeInGrams = useMemo(() => {
        return selectedFoods.reduce((sum, food) => {
            const grams = (HOUSEHOLD_EQUIVALENTS[food.householdUnit ?? "cup"] || 1) * (food.servingSize ?? 1);
            return sum + grams;
        }, 0);
    }, [selectedFoods]);

    useEffect(() => {}, [selectedFoods]);

    return (
        <div className="grid grid-cols-12 gap-6 px-4 py-6">
            <div className="col-span-7">
                <SearchBar onSearch={(query) => handleSearch(query, 1)} />
                {loading && <p className="text-center text-gray-500 mt-2">Loading...</p>}
                {error && <p className="text-center text-red-500 mt-2">{error}</p>}
                <DataTable data={foods} onSelectFood={addFood} />
                <div className="flex justify-center gap-4 mt-4">
                    <Button onClick={() => handleSearch(searchQuery, page - 1)} disabled={page === 1}>
                        ← Previous
                    </Button>
                    <span className="py-2">Page {page}</span>
                    <Button onClick={() => handleSearch(searchQuery, page + 1)}>
                        Next →
                    </Button>
                </div>
                {/* 🏷️ Selected Foods List */}
                <div className="mt-4">
                    {selectedFoods.length === 0 ? (
                        <p className="text-gray-500 text-center">No foods selected.</p>
                    ) : (
                        <ul className="w-full">
                            {selectedFoods.map((food) => (
                                <li key={food.fdcId} className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2">
                                    {/* ✅ Food Name & Remove Button */}
                                    <div className="flex items-center gap-4">
                                        <Button
                                            onClick={() => removeFood(food.fdcId)}
                                            className="bg-red-500 text-white p-2 flex items-center"
                                        >
                                            <TrashIcon className="w-5 h-5" /> {/* ✅ Trash Icon */}
                                        </Button>
                                        <span className="font-bold">{food.description}</span>
                                    </div>

                                    {/* ✅ Serving Size & Household Unit Controls (INLINE) */}
                                    <div className="flex items-center gap-2">
                                        {/* Serving Size Input */}
                                        <Input
                                            type="number"
                                            min="1"
                                            value={food.servingSize ?? 1}
                                            onChange={(e) => updateServingSize(food.fdcId, Number(e.target.value), food.householdUnit ?? "cup")}
                                            className="w-16 text-center border border-black"
                                        />

                                        {/* Household Unit Dropdown */}
                                        <Select
                                            value={food.householdUnit ?? "cup"}
                                            onValueChange={(value) => updateServingSize(food.fdcId, food.servingSize ?? 1, value)}
                                        >
                                            <SelectTrigger className="w-24 border border-black">
                                                <SelectValue placeholder="Unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(HOUSEHOLD_EQUIVALENTS).map((unit) => (
                                                    <SelectItem key={unit} value={unit}>
                                                        {unit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>

            {/* Selected Foods List */}
            <div className="col-span-5 flex flex-col items-center">
                <h2 className="text-lg font-bold mb-2">Selected Foods</h2>

                {/* Main Nutrition Label for all selected foods */}
                {selectedFoods.length > 0 && (
                    <NutritionLabelFDA foods={selectedFoods}  totalServingSize={totalServingSizeInGrams}/>
                )}
            </div>
        </div>
    );
}

export default App;
