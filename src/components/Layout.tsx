import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Watermark from './Watermark';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6">
        <Outlet />
      </main>
      
      <Footer />
      <Watermark />
    </div>
  );
}

export default Layout;