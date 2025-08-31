'use client';

import Navbar from "@/components/navbar/navbar";
import { Provider } from "react-redux";
import { store } from "@/lib/cart/store";
import CartLoader from "@/components/cart-loader";
import UserLoader from "@/components/user-loader";
import StorageWatcher from "@/components/storage-watcher";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Provider store={store}>
          <UserLoader />
          <CartLoader />
          <StorageWatcher />
          <Navbar />
          <main className="pt-20"> {/* Adjust to match your navbar height */}
    {children}
  </main>
      </Provider>
    </>
  );
}