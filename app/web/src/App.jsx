import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { hydrateAuth } from "@/module/auth/hydrate";
import { hydrateLocation } from "@/module/geo/hydrate-location";
import { useCatalogStore } from "@/store/catalog.store";
import { useCartStore } from "@/store/cart.store";
import { Layout } from "@/module/layout/Layout";
import { BagPage } from "@/module/layout/pages/BagPage";
import { AccountShell } from "@/module/account/layouts/AccountShell";
import { BookingsPage } from "@/module/account/pages/BookingsPage";
import { BookingChatPage } from "@/module/account/pages/BookingChatPage";
import { ComplaintChatPage } from "@/module/account/pages/ComplaintChatPage";
import { HelpPage } from "@/module/account/pages/HelpPage";
import { HelpTopicChatPage } from "@/module/account/pages/HelpTopicChatPage";
import { BookingDetailPage } from "@/module/account/pages/BookingDetailPage";
import { ProfilePage } from "@/module/account/pages/ProfilePage";
import { NotificationsPage } from "@/module/account/pages/NotificationsPage";
import { SettingsPage } from "@/module/account/pages/SettingsPage";
import { CheckoutPage } from "@/module/booking/pages/CheckoutPage";
import { OrderConfirmationPage } from "@/module/booking/pages/OrderConfirmationPage";
import { CategoryPage } from "@/module/catalog/pages/CategoryPage";
import { DecorationsPage } from "@/module/catalog/pages/DecorationsPage";
import { ProductPage } from "@/module/catalog/pages/ProductPage";
import { ProductReviewsPage } from "@/module/catalog/pages/ProductReviewsPage";
import { HomePage } from "@/module/home/pages/HomePage";
import { LoginRedirect } from "@/module/layout/pages/LoginRedirect";
import { NotificationsHost } from "@/module/notifications/components/NotificationsHost";
import { SocketProvider } from "@/providers/socket-provider";

export default function App() {
  useEffect(() => {
    void hydrateAuth();
    void hydrateLocation();
    void useCatalogStore.getState().load();
    void useCartStore.getState().load().catch(() => {});
  }, []);

  return (
    <SocketProvider>
    <NotificationsHost />
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/decorations" element={<DecorationsPage />} />
          <Route path="/c/:parentSlug" element={<CategoryPage />} />
          <Route path="/c/:parentSlug/:childSlug" element={<CategoryPage />} />
          <Route path="/p/:id/reviews" element={<ProductReviewsPage />} />
          <Route path="/p/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/account" element={<AccountShell />}>
            <Route index element={<ProfilePage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/:orderId" element={<BookingDetailPage />} />
            <Route path="bookings/:orderId/chat" element={<BookingChatPage />} />
            <Route path="bookings/:orderId/complaint" element={<ComplaintChatPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="help/:topicKey/chat" element={<HelpTopicChatPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/support" element={<Navigate to="/account/help" replace />} />
          <Route path="/bookings" element={<Navigate to="/account/bookings" replace />} />
          <Route path="/settings" element={<Navigate to="/account/settings" replace />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/bag" element={<BagPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </SocketProvider>
  );
}
