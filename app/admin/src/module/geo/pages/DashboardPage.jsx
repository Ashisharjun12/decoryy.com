import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { listAdmin as listCities } from "@/api/cities.api"
import { listAdmin as listPincodes } from "@/api/pincodes.api"
import { getApiError } from "@/api/api"
import { HouseSilhouette } from "@/assets/silhouettes"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardPage() {
  const reduceMotion = useReducedMotion()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [citiesTotal, setCitiesTotal] = useState(0)
  const [pincodesTotal, setPincodesTotal] = useState(0)
  const [serviceable, setServiceable] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError("")
      try {
        const [cities, pincodeTotals, pincodePage] = await Promise.all([
          listCities({ page: 1, limit: 1 }),
          listPincodes({ page: 1, limit: 1 }),
          listPincodes({ page: 1, limit: 100 }),
        ])
        if (cancelled) return
        setCitiesTotal(cities.total ?? 0)
        setPincodesTotal(pincodeTotals.total ?? 0)
        if ((pincodePage.total ?? 0) <= (pincodePage.items?.length ?? 0)) {
          setServiceable(
            (pincodePage.items ?? []).filter((row) => row.isServiceable).length,
          )
        } else {
          setServiceable(null)
        }
      } catch (err) {
        if (!cancelled) setError(getApiError(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const tiles = [
    {
      label: "Cities",
      value: citiesTotal,
      to: "/locations?tab=cities",
      hint: "Open cities",
    },
    {
      label: "Pincodes",
      value: pincodesTotal,
      to: "/locations?tab=pincodes",
      hint: "Open pincodes",
    },
    ...(serviceable == null
      ? []
      : [
          {
            label: "Serviceable",
            value: serviceable,
            to: "/locations?tab=pincodes",
            hint: "Open pincodes",
          },
        ]),
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-medium tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Service area totals from the live allowlist.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1].map((key) => (
              <Card key={key}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-3 h-9 w-16" />
                </CardHeader>
              </Card>
            ))
          : tiles.map((tile, index) => (
              <motion.div
                key={tile.label}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reduceMotion ? 0 : index * 0.04,
                  duration: reduceMotion ? 0 : 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link to={tile.to} className="block outline-none">
                  <Card className="transition-colors hover:bg-muted/40">
                    <CardHeader>
                      <CardDescription>{tile.label}</CardDescription>
                      <CardTitle className="font-heading text-4xl tracking-tight">
                        {tile.value}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{tile.hint}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
      </div>

      <HouseSilhouette className="mt-4 max-w-xs text-muted-foreground" />
    </div>
  )
}
