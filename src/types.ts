export interface Nutrient {
    nutrientId: number;
    value: number;
}

export interface FoodItem {
    fdcId: number;
    description: string;
    brandOwner?: string;
    servingSize?: number;
    foodNutrients: Nutrient[];
}
