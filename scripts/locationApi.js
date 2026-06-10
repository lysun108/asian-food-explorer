const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function searchLocation(query) {
  const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Location request failed");
  }

  const data = await response.json();
  return data[0] || null;
}

export async function searchRestaurantsNearLocation(lat, lon) {
  const radius = 3000;

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${radius},${lat},${lon});
      way["amenity"="restaurant"](around:${radius},${lat},${lon});
      relation["amenity"="restaurant"](around:${radius},${lat},${lon});
    );
    out center tags 20;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    body: overpassQuery
  });

  if (!response.ok) {
    throw new Error("Restaurant request failed");
  }

  const data = await response.json();
  return data.elements || [];
}
