import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/toast"
import { GuestOnly, RequireAdmin } from "@/module/auth/guards"
import { hydrateAuth } from "@/module/auth/hydrate"
import { LoginPage } from "@/module/auth/pages/LoginPage"
import { Layout } from "@/module/layout/Layout"
import { DashboardPage } from "@/module/geo/pages/DashboardPage"
import { LocationsPage } from "@/module/geo/pages/LocationsPage"
import { MediaPage } from "@/module/media/pages/MediaPage"
import { CatalogPage } from "@/module/catalog/pages/CatalogPage"
import { ProductFormPage } from "@/module/catalog/pages/ProductFormPage"
import { AddonFormPage } from "@/module/catalog/pages/AddonFormPage"

export default function App() {
  useEffect(() => {
    void hydrateAuth()
  }, [])

  return (
    <Toaster>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<RequireAdmin />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/products/new" element={<ProductFormPage />} />
              <Route path="/catalog/products/:id" element={<ProductFormPage />} />
              <Route path="/catalog/addons/new" element={<AddonFormPage />} />
              <Route path="/catalog/addons/:id" element={<AddonFormPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Toaster>
  )
}
