import { useState } from "react";
import type { FoodItem } from "@/api/usdaApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface NutritionLabelProps {
    food: FoodItem;
}

export function NutritionLabel({ food }: NutritionLabelProps) {
    const [servingSize, setServingSize] = useState<number>(100); // Default serving size (grams)

    // Function to calculate adjusted nutrient values
    const getNutrientValue = (nutrientValue: number) => {
        return ((nutrientValue * servingSize) / 100).toFixed(1); // Scale nutrients based on input
    };

    return (
        <Card className="p-4 shadow-lg w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-xl">{food.description}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
                <p><strong>Brand:</strong> {food.brandOwner || "N/A"}</p>
                <p><strong>Category:</strong> {food.foodCategory || "Unknown"}</p>

                {/* Input for Adjusting Serving Size */}
                <div className="mt-4 flex items-center gap-2">
                    <label className="font-semibold">Serving Size:</label>
                    <Input
                        type="number"
                        min="1"
                        value={servingSize}
                        onChange={(e) => setServingSize(Number(e.target.value))}
                        className="w-24 text-center"
                    />
                    <span>g</span>
                </div>

                {/* Nutritional Facts */}
                <h3 className="mt-4 font-bold">Nutritional Facts</h3>
                {food.foodNutrients.slice(0, 5).map((nutrient) => (
                    <p key={nutrient.nutrientId}>
                        <strong>{nutrient.nutrientName}:</strong> {getNutrientValue(nutrient.value)} {nutrient.unitName}
                    </p>
                ))}
            </CardContent>
        </Card>
    );
}

