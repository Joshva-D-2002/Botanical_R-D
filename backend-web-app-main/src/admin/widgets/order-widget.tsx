import { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

const REDIRECT_URL = "/app/access"
const STORAGE_KEY = "order_widget_redirected"
const SESSION_TIMEOUT = 22 * 1000

const OrderWidget = () => {
  const [hasRedirectedBefore, setHasRedirectedBefore] = useState(false)

  const isSessionValid = (): boolean => {
    const stored = sessionStorage.getItem(STORAGE_KEY)

    if (!stored) return false

    try {
      const session = JSON.parse(stored)
      const now = Date.now()

      if (now - session.timestamp > SESSION_TIMEOUT) {
        sessionStorage.removeItem(STORAGE_KEY)
        return false
      }

      return session.redirected === true
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
      return false
    }
  }

  const handleRedirect = () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ redirected: true, timestamp: Date.now() })
    )

    try {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', REDIRECT_URL)
        window.location.reload()
      } else {
        window.location.href = REDIRECT_URL
      }
    } catch (error) {
      console.error("Redirect failed:", error)
      window.open(REDIRECT_URL, "_self")
    }
  }

  useEffect(() => {
    const valid = isSessionValid()

    if (!valid) {
      setTimeout(() => handleRedirect(), 1)
    } else {
      setHasRedirectedBefore(true)

      const style = document.createElement("style")
      style.innerHTML = `a[href="/app/access"] { display: none !important; }`
      document.head.appendChild(style)
    }
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default OrderWidget
