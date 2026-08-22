import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { hydrateAuth } from "@/module/auth/hydrate";
import { hydrateLocation } from "@/module/geo/hydrate-location";
import { useCatalogStore } from "@/store/catalog.store";
import { Layout } from "@/module/layout/Layout";
import { PlaceholderPage } from "@/module/layout/pages/PlaceholderPage";
import { AccountPage } from "@/module/account/pages/AccountPage";
import { CategoryPage } from "@/module/catalog/pages/CategoryPage";
import { ProductPage } from "@/module/catalog/pages/ProductPage";
import { HomePage } from "@/module/home/pages/HomePage";
import { LoginRedirect } from "@/module/layout/pages/LoginRedirect";

export default function App() {
  useEffect(() => {
    void hydrateAuth();
    void hydrateLocation();
    void useCatalogStore.getState().load();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/c/:parentSlug" element={<CategoryPage />} />
          <Route path="/c/:parentSlug/:childSlug" element={<CategoryPage />} />
          <Route path="/p/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/account" element={<AccountPage />} />
          <Route
            path="/bookings"
            element={
              <PlaceholderPage
                title="Bookings"
                body="Your decoration bookings will appear here once checkout is live."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                body="Notification and account settings will land here soon."
              />
            }
          />
          <Route
            path="/support"
            element={
              <PlaceholderPage
                title="Support"
                body="Reach us from this page once the help flow is live."
              />
            }
          />
          <Route
            path="/bag"
            element={
              <PlaceholderPage
                title="Bag"
                body="Your bag is empty. Cart checkout is not wired on this pass."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
