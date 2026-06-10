import { setupNavigation } from "./navigation.js";
import { searchLocation, searchRestaurantsNearLocation } from "./locationApi.js";
import { qs, setYear, showLoading, showMessage, hideMessage } from "./utils.js";

setYear();
setupNavigation();

const form = qs("#location-form");
const input = qs("#location-search");
const resultsContainer = qs("#location-results");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();

  if (!query) {
    showMessage("Please enter a city or place.", "error");
    return;
  }

  showLoading(true);
  hideMessage();
  resultsContainer.innerHTML = "";

  try {
    const location = await searchLocation(query);

    if (!location) {
      showMessage("No location found. Try another city or place.", "error");
      return;
    }

    const restaurants = await searchRestaurantsNearLocation(location.lat, location.lon);

    if (!restaurants.length) {
      showMessage("No restaurants found near this location.", "error");
      return;
    }

    resultsContainer.innerHTML = `
      <article class="location-card">
        <h2>Restaurants near ${location.display_name}</h2>
        <p><strong>Latitude:</strong> ${location.lat}</p>
        <p><strong>Longitude:</strong> ${location.lon}</p>
        <p><strong>Search radius:</strong> About 3 km</p>
      </article>

      ${restaurants.map((restaurant) => {
        const tags = restaurant.tags || {};
        const lat = restaurant.lat || restaurant.center?.lat;
        const lon = restaurant.lon || restaurant.center?.lon;
        const name = tags.name || "Unnamed Restaurant";
        const cuisine = tags.cuisine || "Not listed";
        const street = tags["addr:street"] || "";
        const houseNumber = tags["addr:housenumber"] || "";
        const city = tags["addr:city"] || "";
        const address = `${houseNumber} ${street} ${city}`.trim() || "Address not listed";
        const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;

        return `
          <article class="location-card">
            <h2>${name}</h2>
            <p><strong>Cuisine:</strong> ${cuisine}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Latitude:</strong> ${lat}</p>
            <p><strong>Longitude:</strong> ${lon}</p>
            <p><a href="${mapLink}" target="_blank" rel="noopener">Open in OpenStreetMap</a></p>
          </article>
        `;
      }).join("")}
    `;
  } catch (error) {
    showMessage("Could not load restaurant data. Please try again later.", "error");
  } finally {
    showLoading(false);
  }
});
