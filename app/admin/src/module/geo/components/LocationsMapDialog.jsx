import { useEffect, useState } from "react"
import { useMap } from "react-leaflet"
import { listActive, listAdmin } from "@/api/cities.api"
import { INDIA_CENTER, INDIA_STATE_COORDS } from "@/data/state-coords"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Map,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map"

function InvalidateSizeOnOpen() {
  const map = useMap()

  useEffect(() => {
    const id = window.setTimeout(() => {
      map.invalidateSize()
    }, 50)
    return () => window.clearTimeout(id)
  }, [map])

  return null
}

function statesWithActiveCities(cities) {
  const byState = Object.create(null)

  for (const city of cities ?? []) {
    if (!city?.state) continue
    const names = byState[city.state] ?? []
    names.push(city.name)
    byState[city.state] = names
  }

  return Object.entries(byState)
    .map(([state, cityNames]) => ({
      state,
      cityNames: cityNames.sort((a, b) => a.localeCompare(b)),
      position: INDIA_STATE_COORDS[state],
    }))
    .filter((row) => row.position)
    .sort((a, b) => a.state.localeCompare(b.state))
}

async function loadActiveCities() {
  try {
    const cities = await listActive()
    if (Array.isArray(cities)) return cities
  } catch {
    // Public list can fail independently of admin routes.
  }
  const data = await listAdmin({ page: 1, limit: 100, isActive: "true" })
  return data?.items ?? []
}

export function LocationsMapDialog({ open, onOpenChange }) {
  const [markers, setMarkers] = useState([])

  useEffect(() => {
    if (!open) return

    let cancelled = false

    loadActiveCities()
      .then((cities) => {
        if (!cancelled) setMarkers(statesWithActiveCities(cities))
      })
      .catch(() => {
        if (!cancelled) setMarkers([])
      })

    return () => {
      cancelled = true
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Active states</DialogTitle>
          <DialogDescription>
            States with at least one active city.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <div className="h-112 overflow-hidden rounded-md">
            <Map center={INDIA_CENTER} zoom={5} className="z-0 h-full">
              <MapTileLayer />
              <MapZoomControl />
              <InvalidateSizeOnOpen />
              {markers.map((city) => (
                <MapMarker key={city.state} position={city.position}>
                  <MapPopup>
                    {city.state}
                    {city.cityNames.length ? `: ${city.cityNames.join(", ")}` : ""}
                  </MapPopup>
                </MapMarker>
              ))}
            </Map>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
