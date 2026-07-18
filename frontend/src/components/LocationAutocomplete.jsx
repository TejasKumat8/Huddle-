import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { loadGoogleMaps } from "../lib/loadGoogleMaps";

// Wraps Google's PlaceAutocompleteElement (the current, non-deprecated
// widget — the older google.maps.places.Autocomplete stopped being
// available to new API keys as of March 2025). Falls back to a plain text
// field if no API key is configured or the script fails to load, so huddle
// creation never breaks because of a missing key.
export default function LocationAutocomplete({
  name,
  onNameChange,
  onPlaceSelected,
  placeholder = "Search for a place",
  className = "",
}) {
  const containerRef = useRef(null);
  const elementRef = useRef(null);
  const [mapsFailed, setMapsFailed] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(async (maps) => {
        if (cancelled || !containerRef.current) return;

        const { PlaceAutocompleteElement } = await maps.importLibrary("places");
        const el = new PlaceAutocompleteElement({ locationBias: undefined });

        // Officially supported direct styling for this element (no shadow
        // DOM hacking needed) — matches the app's dark ticket-stub theme.
        el.style.width = "100%";
        el.style.backgroundColor = "#2a1c47";
        el.style.border = "1px solid #3d2c63";
        el.style.borderRadius = "12px";
        el.style.colorScheme = "dark";
        el.setAttribute("placeholder", placeholder);

        el.addEventListener("gmp-select", async ({ placePrediction }) => {
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ["displayName", "formattedAddress", "location", "id"] });
          onPlaceSelected({
            name: place.displayName || "",
            address: place.formattedAddress || "",
            placeId: place.id || "",
            lat: place.location?.lat() ?? null,
            lng: place.location?.lng() ?? null,
          });
        });

        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(el);
        elementRef.current = el;
        setMapsReady(true);
      })
      .catch(() => {
        if (!cancelled) setMapsFailed(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mapsFailed) {
    return (
      <div className="relative flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-sm text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none ${className}`}
        />
        <span
          title="Location search is unavailable right now — you can still type a spot name manually."
          className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/25"
        >
          <AlertCircle size={14} />
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div ref={containerRef} className={mapsReady ? "min-h-[42px]" : "hidden"} />
      {!mapsReady && (
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Loading location search…"
          disabled
          className="w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-sm text-paper/40 placeholder:text-paper/30"
        />
      )}
    </div>
  );
}
