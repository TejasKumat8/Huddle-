let loadPromise = null;

// Loads the Google Maps JS API (places library) exactly once, however many
// components ask for it. Resolves to `window.google.maps`. If no API key is
// configured, or the script fails to load (bad key, network, billing not
// enabled), it rejects — callers fall back to a plain text input rather
// than breaking the page.
export function loadGoogleMaps() {
  if (loadPromise) return loadPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  loadPromise = new Promise((resolve, reject) => {
    if (!apiKey) {
      reject(new Error("No VITE_GOOGLE_MAPS_API_KEY configured"));
      return;
    }
    if (window.google?.maps?.places) {
      resolve(window.google.maps);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=__huddleGoogleMapsLoaded`;
    script.async = true;
    script.defer = true;

    window.__huddleGoogleMapsLoaded = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));

    document.head.appendChild(script);
  });

  return loadPromise;
}
