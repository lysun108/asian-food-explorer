import { renderMealCards } from "./meals.js";
import { showLoading, showMessage, hideMessage } from "./utils.js";

const asianAreas = [
  "Chinese",
  "Japanese",
  "Thai",
  "Indian",
  "Malaysian",
  "Vietnamese",
  "Filipino"
];

export async function loadCategories(categoryContainer, mealContainer, statusElement) {
  categoryContainer.innerHTML = "";

  asianAreas.forEach((area) => {
    const button = document.createElement("button");
    button.className = "category-button";
    button.type = "button";
    button.textContent = area;
    button.dataset.area = area;
    categoryContainer.appendChild(button);
  });

  categoryContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-area]");

    if (!button) {
      return;
    }

    const selectedArea = button.dataset.area;

    showLoading(true);
    hideMessage();
    statusElement.textContent = `Showing ${selectedArea} dishes.`;

    try {
      const meals = await getMealsByArea(selectedArea);
      renderMealCards(meals, mealContainer);
    } catch (error) {
      showMessage("Could not load dishes. Please try again.", "error");
    } finally {
      showLoading(false);
    }
  });
}

async function getMealsByArea(area) {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`
  );

  if (!response.ok) {
    throw new Error("Area API request failed.");
  }

  const data = await response.json();
  return data.meals || [];
}
