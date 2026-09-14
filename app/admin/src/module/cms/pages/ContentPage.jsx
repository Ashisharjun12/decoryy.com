import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { listAdmin as listCities } from "@/api/cities.api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnnouncementsPanel } from "@/module/cms/pages/AnnouncementsPanel"
import { BannersPanel } from "@/module/cms/pages/BannersPanel"
import { TestimonialsPanel } from "@/module/cms/pages/TestimonialsPanel"

const TABS = ["announcements", "banners", "testimonials"]

function normalizeTab(value) {
  return TABS.includes(value) ? value : "announcements"
}

export function ContentPage() {
  const [params, setParams] = useSearchParams()
  const tab = normalizeTab(params.get("tab"))
  const [cities, setCities] = useState([])

  useEffect(() => {
    listCities({ page: 1, limit: 100, isActive: "true" })
      .then((data) => setCities(data.items ?? []))
      .catch(() => setCities([]))
  }, [])

  function onTabChange(next) {
    setParams({ tab: next }, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium tracking-tight">Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage homepage announcements, banners, and editorial testimonials. City items prepend global content.
        </p>
      </div>
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>
        <TabsContent value="announcements">
          <AnnouncementsPanel cities={cities} />
        </TabsContent>
        <TabsContent value="banners">
          <BannersPanel cities={cities} />
        </TabsContent>
        <TabsContent value="testimonials">
          <TestimonialsPanel cities={cities} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
