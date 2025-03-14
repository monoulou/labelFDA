import {useState, useRef, useCallback} from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import type { FoodItem } from "@/api/usdaApi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// FDA Daily Values
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
    "slice": 1,
    "gr/ml": 1,
};

interface NutritionLabelFDAProps {
    foods: FoodItem[];
    totalServingSize: string;
}

export function NutritionLabelFDA({ foods, totalServingSize }: NutritionLabelFDAProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [servingsPerContainer, setServingsPerContainer] = useState<number>(1);

    const getDailyValueKey = (nutrientId: number): keyof typeof DAILY_VALUES | undefined => {
        const mapping: Record<number, keyof typeof DAILY_VALUES> = {
            1008: "calories",
            1004: "totalFat",
            1258: "saturatedFat",
            1253: "cholesterol",
            1093: "sodium",
            1005: "totalCarbohydrate",
            1079: "dietaryFiber",
            1003: "protein",
        };
        return mapping[nutrientId];
    };

    const getTotalCalories = () => {
        let totalCalories = 0;

        foods.forEach((food) => {
            const calorieIds = [2047, 2048, 1008];

            for (const id of calorieIds) {
                const nutrient = food.foodNutrients.find((n) => n.nutrientId === id);

                // ✅ Ensure safe access to householdUnit & servingSize
                const householdUnit = food.householdUnit ?? "cup"; // Default: "cup"
                const servingSize = food.servingSize ?? 1; // Default: 1

                // ✅ Compute metric equivalent safely
                const foodMetricEquivalent = (HOUSEHOLD_EQUIVALENTS[householdUnit] ?? 1) * servingSize;

                if (nutrient) {
                    totalCalories += (nutrient.value * foodMetricEquivalent) / 100;
                    break; // ✅ Stop checking once the first valid calorie ID is found
                }
            }
        });

        return totalCalories.toFixed(2); // ✅ Keep two decimal places
    };


    // ✅ Function to calculate total nutrient value
    const getTotalNutrientValue = (nutrientId: number): string => {
        let totalValue = 0;

        foods.forEach((food) => {
            const householdUnit = food.householdUnit ?? "cup"; // ✅ Default to "cup"
            const servingSize = food.servingSize ?? 1; // ✅ Default to 1

            // ✅ Prevent NaN if householdUnit is missing in HOUSEHOLD_EQUIVALENTS
            const foodMetricEquivalent = (HOUSEHOLD_EQUIVALENTS[householdUnit] ?? 1) * servingSize;

            const nutrient = food.foodNutrients.find((n) => n.nutrientId === nutrientId);
            if (nutrient) {
                totalValue += (nutrient.value * foodMetricEquivalent) / 100; // ✅ Correct scaling
            }
        });
        return totalValue.toFixed(2); // ✅ Keep two decimal places
    };


    // ✅ Function to calculate % Daily Value
    const getTotalDailyValuePercentage = (nutrientId: number): string => {
        const totalValue = parseFloat(getTotalNutrientValue(nutrientId));
        const dailyValueKey = getDailyValueKey(nutrientId);
        const dailyValue = dailyValueKey ? DAILY_VALUES[dailyValueKey] : undefined;

        if (!dailyValue || dailyValue === 0) return "-";

        return ((totalValue / dailyValue) * 100).toFixed(0) + "%";
    };

    // ✅ After Print function
    const handleAfterPrint = useCallback(() => {
        //console.log("`onAfterPrint` called");
    }, []);

    // ✅ Before Print function
    const handleBeforePrint = useCallback(() => {
        //console.log("`onBeforePrint` called");
        return Promise.resolve();
    }, []);

    // ✅ Print function
    const printFn = useReactToPrint({
        contentRef: cardRef,
        documentTitle: "Nutrition_Facts",
        onAfterPrint: handleAfterPrint,
        onBeforePrint: handleBeforePrint,
    });

    // ✅ Export as PDF using html2canvas + jsPDF
    const handleDownloadPDF = async () => {
        if (!cardRef.current) return;

        // ✅ Hide elements before capturing
        document.querySelectorAll('.hide-on-print').forEach(el => (el as HTMLElement).style.display = 'none');
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: "#ffffff", // ✅ Force white background (prevents `oklch` issue)
                useCORS: true, // ✅ Ensures images from external sources are handled
                scale: 2, // ✅ Improves quality
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            pdf.addImage(imgData, "PNG", 10, 10, 190, 0); // ✅ Adjust positioning
            pdf.save("Nutrition_Facts.pdf");

            // ✅ Restore elements after PDF is generated
            document.querySelectorAll('.hide-on-print').forEach(el => (el as HTMLElement).style.display = '');
        } catch (error) {
            console.error("PDF Export Error:", error);
        }
    };


    return (
        <div>
            <Card ref={cardRef} className="p-4 shadow-lg w-full max-w-md mx-auto border-4 border-black text-black">
                <h2 className="text-2xl font-bold text-center border-b-4 border-black pb-2">NUTRITION FACTS</h2>

                {/* Serving Size */}
                <div className="text-lg font-bold border-b border-black pb-2 mt-2">
                    <div className="flex justify-between">
                        {/* ✅ Display Computed Serving Size */}
                        <span className="font-black">{servingsPerContainer} Servings Per Container</span>
                        <Input
                            type="number"
                            min="1"
                            value={servingsPerContainer}
                            onChange={(e) => setServingsPerContainer(Number(e.target.value))}
                            className="w-20 text-center border border-black ml-2 hide-on-print"
                        />
                    </div>
                    <span className="font-black">Serving Size ({totalServingSize}g)</span>
                </div>

                {/* Calories Section */}
                <div className="text-3xl font-black border-b-4 border-black mt-2 pb-1">
                    <span>Calories: {getTotalCalories()}</span>
                    <span className="text-sm font-normal ml-2">(Total: {parseFloat(getTotalCalories()) * servingsPerContainer})</span>
                </div>
                {/* 🏷️ Nutrient List */}
                <div className="mt-2 text-lg">
                    <p className="border-b border-gray-400 flex justify-end font-black text-lg">
                        <span className="font-black text-sm ml-2">% Daily Value*</span>
                    </p>
                    <p className="border-b border-gray-400 flex justify-between font-black text-lg">
                        <span>Total Fat</span> <span>{getTotalNutrientValue(1004)}g ({getTotalDailyValuePercentage(1004)})</span>
                    </p>
                    <p className="ml-4 flex justify-between text-base">
                        <span>Saturated Fat</span> <span>{getTotalNutrientValue(1258)}g ({getTotalDailyValuePercentage(1258)})</span>
                    </p>
                    <p className="border-b border-gray-400 flex justify-between font-black">
                        <span>Cholesterol</span> <span>{getTotalNutrientValue(1253)}mg ({getTotalDailyValuePercentage(1253)})</span>
                    </p>
                    <p className="border-b border-gray-400 flex justify-between font-black">
                        <span>Sodium</span> <span>{getTotalNutrientValue(1093)}mg ({getTotalDailyValuePercentage(1093)})</span>
                    </p>
                    <p className="border-b border-gray-400 flex justify-between font-black">
                        <span>Total Carbohydrate</span> <span>{getTotalNutrientValue(1005)}g ({getTotalDailyValuePercentage(1005)})</span>
                    </p>
                    <p className="ml-4 flex justify-between text-base">
                        <span>Dietary Fiber</span> <span>{getTotalNutrientValue(1079)}g ({getTotalDailyValuePercentage(1079)})</span>
                    </p>
                    <p className="border-b border-gray-400 flex justify-between font-black">
                        <span>Protein</span> <span>{getTotalNutrientValue(1003)}g ({getTotalDailyValuePercentage(1003)})</span>
                    </p>
                    {/* 🏷️ FDA Disclaimer */}
                    <p className="mt-4 text-xs border-black pt-2">
                        *The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet.
                        2,000 calories a day is used for general nutrition advice.
                    </p>
                    {/* 🏷️ Ingredients List */}
                    <p className="mt-2 text-xs border-black pt-2">
                        <strong>Ingredients:</strong> {foods.map((food) => food.description).join(", ")}
                    </p>
                </div>
            </Card>
            {/* 🏷️ Export Buttons */}
            <div className="mt-4 flex justify-center gap-4">
                <Button onClick={printFn} className="bg-blue-500 text-white">🖨️ Print</Button>
                <Button onClick={handleDownloadPDF} className="bg-green-500 text-white">📄 Download PDF</Button>
            </div>
        </div>

    );
}
