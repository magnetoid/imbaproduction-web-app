import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Home from '@/pages/Home'
import Work from '@/pages/Work'
import Services from '@/pages/Services'
import About from '@/pages/About'
import Blog from '@/pages/Blog'
import Contact from '@/pages/Contact'
import ServicePage from '@/pages/services/ServicePage'
import AdminLayout from '@/admin/AdminLayout'
import Dashboard from '@/admin/Dashboard'
import HeroVideosAdmin from '@/admin/HeroVideosAdmin'
import PortfolioAdmin from '@/admin/PortfolioAdmin'
import BlogAdmin from '@/admin/BlogAdmin'
import QuoteRequests from '@/admin/QuoteRequests'

// Scroll reveal observer
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    const els = document.querySelectorAll('.reveal')
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  })
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  useScrollReveal()
  return (
    <>
      <div className="scan-line" />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/work" element={<PublicLayout><Work /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/services/:slug" element={<PublicLayout><ServicePage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="hero-videos" element={<HeroVideosAdmin />} />
        <Route path="portfolio" element={<PortfolioAdmin />} />
        <Route path="blog" element={<BlogAdmin />} />
        <Route path="quotes" element={<QuoteRequests />} />
      </Route>
    </Routes>
  )
}
