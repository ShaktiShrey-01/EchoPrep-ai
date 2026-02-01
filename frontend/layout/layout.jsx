import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617]">
      <Header />
      
      {/* flex-1 makes main take up remaining space. overflow-hidden prevents body scroll */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;