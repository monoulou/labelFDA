import {useState} from "react";
import {SearchBar} from "@/components/searchBar.tsx";
import {DataTable} from "@/components/dataTable.tsx";
import { fetchFoodData } from "@/api/usdaApi.ts";
import type { FoodItem } from "@/api/usdaApi.ts";
import { Button } from "@/components/ui/button";
import {NutritionLabelFDA} from "@/components/nutritionLabelFDA.tsx";

function App() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [foods, setFoods] = useState<FoodItem[]>([]); // Store API data
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1); // Pagination state
    const pageSize = 10; // Number of results per page

    // Handle search and fetch data
    const handleSearch = async (query: string,  pageNumber: number = 1) => {
        setSearchQuery(query);
        setPage(pageNumber); // Reset page to 1 on new search
        setLoading(true);
        setError(null); // Reset previous errors

        try {
            const data = await fetchFoodData(query, pageNumber, pageSize);
            setFoods(data); // Store fetched food data
        } catch (err) {
            setError("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => handleSearch(searchQuery, page + 1);
    const handlePrevPage = () => handleSearch(searchQuery, Math.max(1, page - 1));

      return (
          <div className="grid grid-cols-12 gap-6 px-4 py-6">
              {/* Left Side - Search & Table */}
              <div className="col-span-7">
                  <SearchBar onSearch={(query) => handleSearch(query, 1)} />
                  {loading && <p className="text-center text-gray-500 mt-2">Loading...</p>}
                  {error && <p className="text-center text-red-500 mt-2">{error}</p>}
                  <DataTable data={foods} onSelectFood={setSelectedFood} />

                  {/*Pagination Controls*/}
                  <div className="flex justify-center gap-4 mt-4">
                      <Button onClick={handlePrevPage} disabled={page === 1}>
                          ← Previous
                      </Button>
                      <span className="py-2">Page {page}</span>
                      <Button onClick={handleNextPage}>
                          Next →
                      </Button>
                  </div>
              </div>

              {/* Right Side - Nutrition Facts */}
              <div className="col-span-5">
                  {selectedFood ? (
                      <NutritionLabelFDA food={selectedFood} />
                  ) : (
                      <p className="text-gray-500 text-center mt-10">Select a food to see nutrition facts.</p>
                  )}
              </div>
          </div>
      )
}

export default App
