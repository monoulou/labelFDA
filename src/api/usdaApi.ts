import axios from "axios";

// USDA API Details
const API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
const API_KEY = import.meta.env.VITE_USDA_API_KEY; // Store in .env

export interface Nutrient {
    nutrientName: string;
    nutrientId: number;
    name: string;
    unitName: string;
    value: number;
}

// Define the food item type
export interface FoodItem {
    householdUnit?: any;
    servingsPerContainer?: number;
    servingSize?: number;
    //unit?: string;
    fdcId: number;
    description: string;
    brandOwner?: string;
    foodCategory?: string;
    foodNutrients: Nutrient[];
}


// Function to fetch food data
export const fetchFoodData = async (query: string, pageNumber: number = 1, pageSize: number = 10): Promise<FoodItem[]> => {
    if (!API_KEY) {
        throw new Error("Missing USDA API key in .env file");
    }

    try {
        const response = await axios.get(API_URL, {
            params: {
                query,
                api_key: API_KEY,
                pageNumber, // Limit results for testing
                pageSize,
                //dataType: ["Branded", "Survey (FNDDS)"],
            },
        });

        return response.data.foods || []; // Returns an array of food items
    } catch (error) {
        console.error("Error fetching food data:", error);
        throw error;
    }
};


