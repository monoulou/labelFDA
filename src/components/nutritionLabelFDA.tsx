import { useState } from "react";
import type { FoodItem } from "@/api/usdaApi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

// FDA Daily Values for %DV Calculation
const DAILY_VALUES = {
    calories: 2000,
    totalFat: 65,
    saturatedFat: 20,
    cholesterol: 300,
    sodium: 2400,
    totalCarbohydrate: 300,
    dietaryFiber: 25,
    protein: 50,
};

// Household Measure Equivalents
const HOUSEHOLD_EQUIVALENTS: Record<string, number> = {
    "cup": 240,
    "tbsp": 15,
    "tsp": 5,
    "fl oz": 30,
    "oz": 28,
    "slice": 0, // Variable
    "piece": 0, // Variable
};

interface NutritionLabelFDAProps {
    food: FoodItem;
}

export function NutritionLabelFDA({ food }: NutritionLabelFDAProps) {
    const [householdUnit, setHouseholdUnit] = useState<string>("cup");
    const [servingSize, setServingSize] = useState<number>(1);
    const [servingsPerContainer, setServingsPerContainer] = useState<number>(1);

    // Get metric equivalent (g or mL)
    const metricEquivalent = HOUSEHOLD_EQUIVALENTS[householdUnit] * servingSize || servingSize;

    // Concatenated Serving Size String
    const servingSizeText = `Serving Size ${servingSize} ${householdUnit} (${metricEquivalent}g/mL)`;

    // ✅ Function to get per-serving nutrient value
    const getNutrientValue = (nutrientId: number): string => {
        const nutrient = food.foodNutrients.find((n) => n.nutrientId === nutrientId);
        if (!nutrient) return "0.00";

        return ((nutrient.value * metricEquivalent) / 100).toFixed(2);
    };

    // ✅ Function to get total container nutrient value
    const getTotalNutrientValue = (nutrientId: number): string => {
        return (parseFloat(getNutrientValue(nutrientId)) * servingsPerContainer).toFixed(2);
    };


    // Function to calculate % Daily Value
    const getDailyValuePercentage = (nutrientId: number, dailyValue: number): string => {
        const value = parseFloat(getNutrientValue(nutrientId));
        if (dailyValue === 0) return "-";
        return ((value / dailyValue) * 100).toFixed(0) + "%";
    };

    return (
        <Card className="p-4 shadow-lg w-full max-w-md mx-auto border-4 border-black text-black">
            <h2 className="text-2xl font-bold text-center border-b-4 border-black pb-2">NUTRITION FACTS</h2>

            {/* 🏷️ Servings Per Container & Serving Size (TOP) */}
            <div className="text-lg font-bold border-b border-black pb-2 mt-2">
                <div className="flex justify-between">
                    <span className="font-black">{servingsPerContainer} Servings Per Container</span>
                    <Input
                        type="number"
                        min="1"
                        value={servingsPerContainer}
                        onChange={(e) => setServingsPerContainer(Number(e.target.value))}
                        className="w-20 text-center border border-black ml-2"
                    />
                </div>
                <div className="flex justify-between mt-1 items-center">
                    <span className="font-black">{servingSizeText}</span>

                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min="1"
                            value={servingSize}
                            onChange={(e) => setServingSize(Number(e.target.value))}
                            className="w-16 text-center border border-black"
                        />
                        <Select value={householdUnit} onValueChange={setHouseholdUnit}>
                            <SelectTrigger className="w-20 border border-black">
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
                </div>
            </div>

            {/* 🏷️ Calories Section */}
            <div className="text-xl font-bold border-b-4 border-black mt-2 pb-1">
                <span>Calories: {getNutrientValue(1008)}</span>
                <span className="text-sm font-normal ml-2">(Total: {getTotalNutrientValue(1008)})</span>
            </div>


            {/* 🏷️ Nutrient List (Bold for Required Nutrients) */}
            <div className="mt-2 text-lg">
                <p className="border-b border-gray-400 flex justify-between font-black">
                    <span>Total Fat</span> <span>{getNutrientValue(1004)}g ({getDailyValuePercentage(1004, DAILY_VALUES.totalFat)})</span>
                </p>
                <p className="ml-4 flex justify-between">
                    <span>Saturated Fat</span> <span>{getNutrientValue(1258)}g ({getDailyValuePercentage(1258, DAILY_VALUES.saturatedFat)})</span>
                </p>
                <p className="border-b border-gray-400 flex justify-between font-black">
                    <span>Cholesterol</span> <span>{getNutrientValue(1253)}mg ({getDailyValuePercentage(1253, DAILY_VALUES.cholesterol)})</span>
                </p>
                <p className="border-b border-gray-400 flex justify-between font-black">
                    <span>Sodium</span> <span>{getNutrientValue(1093)}mg ({getDailyValuePercentage(1093, DAILY_VALUES.sodium)})</span>
                </p>
                <p className="border-b border-gray-400 flex justify-between font-black">
                    <span>Total Carbohydrate</span> <span>{getNutrientValue(1005)}g ({getDailyValuePercentage(1005, DAILY_VALUES.totalCarbohydrate)})</span>
                </p>
                <p className="ml-4 flex justify-between">
                    <span>Dietary Fiber</span> <span>{getNutrientValue(1079)}g ({getDailyValuePercentage(1079, DAILY_VALUES.dietaryFiber)})</span>
                </p>
                <p className="border-b border-gray-400 flex justify-between font-black">
                    <span>Protein</span> <span>{getNutrientValue(1003)}g ({getDailyValuePercentage(1003, DAILY_VALUES.protein)})</span>
                </p>
            </div>

            {/* 🏷️ Export Button */}
            <div className="mt-4 flex justify-center">
                <Button className="w-full bg-black text-white hover:bg-gray-800">Export as PDF</Button>
            </div>
        </Card>
    );
}
