import { Routes, Route, Navigate } from 'react-router-dom'
import '@/i18n'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import QuoteModal from '@/components/QuoteModal'
import { QuoteModalProvider } from '@/contexts/QuoteModalContext'
import Home from '@/pages/Home'
import Work from '@/pages/Work'
import Services from '@/pages/Services'
import About from '@/pages/About'
import Blog from '@/pages/Blog'
import BlogPost from '@/pages/BlogPost'
import Contact from '@/pages/Contact'
import Reviews from '@/pages/Reviews'
import ServicePage from '@/pages/services/ServicePage'
import AdminLayout from '@/admin/AdminLayout'
import Dashboard from '@/admin/Dashboard'
import HeroVideosAdmin from '@/admin/HeroVideosAdmin'
import PortfolioAdmin from '@/admin/PortfolioAdmin'
import BlogAdmin from '@/admin/BlogAdmin'
import BlogPostEdit from '@/admin/BlogPostEdit'
import QuoteRequests from '@/admin/QuoteRequests'
import MediaAdmin from '@/admin/MediaAdmin'
import BlogCategoriesAdmin from '@/admin/BlogCategoriesAdmin'
import ImportAdmin from '@/admin/ImportAdmin'
import TranslationsAdmin from '@/admin/TranslationsAdmin'
import TestimonialsAdmin from '@/admin/TestimonialsAdmin'
import SEOManager from '@/admin/SEOManager'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <Nav />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <QuoteModalProvider>
      <QuoteModal />
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/work" element={<PublicLayout><Work /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/services/:slug" element={<PublicLayout><ServicePage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
<Route path="/reviews" element={<PublicLayout><Reviews /></PublicLayout>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="hero-videos" element={<HeroVideosAdmin />} />
          <Route path="portfolio" element={<PortfolioAdmin />} />
          <Route path="blog" element={<BlogAdmin />} />
          <Route path="blog/new" element={<BlogPostEdit />} />
          <Route path="blog/edit/:id" element={<BlogPostEdit />} />
          <Route path="blog/categories" element={<BlogCategoriesAdmin />} />
          <Route path="media" element={<MediaAdmin />} />
          <Route path="import" element={<ImportAdmin />} />
          <Route path="quotes" element={<QuoteRequests />} />
          <Route path="seo" element={<SEOManager />} />
          <Route path="translations" element={<TranslationsAdmin />} />
          <Route path="testimonials" element={<TestimonialsAdmin />} />
        </Route>
      </Routes>
    </QuoteModalProvider>
  )
}
