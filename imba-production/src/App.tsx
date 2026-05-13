import { Routes, Route, Navigate } from 'react-router-dom'
import { useRouteViewTransition } from '@/lib/view-transitions'
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
import PortfolioEdit from '@/admin/PortfolioEdit'
import HeroVideoEdit from '@/admin/HeroVideoEdit'
import TestimonialEdit from '@/admin/TestimonialEdit'
import TeamAdmin from '@/admin/TeamAdmin'
import TeamMemberEdit from '@/admin/TeamMemberEdit'
import SiteSettings from '@/admin/SiteSettings'
import ServicesAdmin from '@/admin/ServicesAdmin'
import ServiceEdit from '@/admin/ServiceEdit'
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

function RouteTransitions() {
  useRouteViewTransition()
  return null
}

export default function App() {
  return (
    <QuoteModalProvider>
      <RouteTransitions />
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
          <Route path="hero-videos/new" element={<HeroVideoEdit />} />
          <Route path="hero-videos/edit/:id" element={<HeroVideoEdit />} />
          <Route path="portfolio" element={<PortfolioAdmin />} />
          <Route path="portfolio/new" element={<PortfolioEdit />} />
          <Route path="portfolio/edit/:id" element={<PortfolioEdit />} />
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
          <Route path="testimonials/new" element={<TestimonialEdit />} />
          <Route path="testimonials/edit/:id" element={<TestimonialEdit />} />
          <Route path="team" element={<TeamAdmin />} />
          <Route path="team/new" element={<TeamMemberEdit />} />
          <Route path="team/edit/:id" element={<TeamMemberEdit />} />
          <Route path="services" element={<ServicesAdmin />} />
          <Route path="services/new" element={<ServiceEdit />} />
          <Route path="services/edit/:id" element={<ServiceEdit />} />
          <Route path="settings" element={<SiteSettings />} />
        </Route>
      </Routes>
    </QuoteModalProvider>
  )
}
