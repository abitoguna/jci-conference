export interface Config {
    id: number;
    isServingMeal: boolean;
    mealType?: 'breakfast' | 'lunch' | 'dinner';
    banquetMode: boolean;
}