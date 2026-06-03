import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Wraps React Router route changes in `document.startViewTransition`.
 * Chrome 111+, Safari 18+, Edge 111+ render a cross-fade between routes;
 * unsupported browsers (Firefox without flag) get instant nav as today.
 *
 * The actual fade keyframes live in src/index.css under `::view-transition-*`.
 */
export function useRouteViewTransition() {
  const location = useLocation()
  const navType = useNavigationType()

  useEffect(() => {
    if (navType === 'POP') return  // browser back/forward feels native already
    type StartVT = (cb: () => void | Promise<void>) => unknown
    const startFn = (document as unknown as { startViewTransition?: StartVT }).startViewTransition
    if (typeof startFn === 'function') {
      // React has already painted the new route by the time this effect fires;
      // startViewTransition records the snapshot and animates between them.
      // Call bound to `document` — a detached call throws "Illegal invocation".
      try { startFn.call(document, () => {}) } catch { /* unsupported / mid-transition — ignore */ }
    }
  }, [location.pathname, navType])
}
