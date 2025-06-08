import { useEffect, useState } from "react"

const AccessDeniedWidget = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [userEmail, setUserEmail] = useState("")

  // 🧠 Fetch current user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/admin/users/me', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (response.ok) {
          const data = await response.json()
          const email = data.user?.email
          if (email) setUserEmail(email)
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error)
      }
    }

    fetchUserInfo()
  }, [])

  // 🌐 Detect path changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }

    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(history, args)
      handleLocationChange()
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args)
      handleLocationChange()
    }

    window.addEventListener('popstate', handleLocationChange)

    return () => {
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  // 🚫 Show popup if usera tries to access restricted routes
  useEffect(() => {
    const restrictedPaths = [
      "/app/products/create",
      "/app/products/import",
      "/app/products/export",
      "/app/categories",
      "/app/collections/create",
    ]

    if (userEmail === "usera@example.com" && restrictedPaths.includes(currentPath)) {
      const existing = document.getElementById("access-denied-popup")
      if (existing) return

      const styleSheet = document.createElement("style")
      styleSheet.textContent = `
        .access-denied-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }
        .access-denied-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 90%;
          text-align: center;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .access-denied-icon {
          font-size: 60px;
          color: #ef4444;
          margin-bottom: 20px;
        }
        .access-denied-title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
        }
        .access-denied-message {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 25px;
          line-height: 1.5;
        }
        .access-denied-button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .access-denied-button:hover {
          background: #dc2626;
        }
      `
      document.head.appendChild(styleSheet)

      const popup = document.createElement("div")
      popup.id = "access-denied-popup"
      popup.className = "access-denied-popup"
      popup.innerHTML = `
        <div class="access-denied-content">
          <div class="access-denied-icon">🚫</div>
          <div class="access-denied-title">Access Denied</div>
          <div class="access-denied-message">
            You don't have permission to access this page.
          </div>
          <button class="access-denied-button" onclick="history.back(); this.closest('.access-denied-popup')?.remove();">
            Understood
          </button>
        </div>
      `
      document.body.appendChild(popup)
    }
  }, [currentPath, userEmail])

  return null
}

export const config = defineWidgetConfig({
  zone: [
    "product.list.before",
    "product_category.list.before",
    "product_collection.list.before",
  ],
})

export default AccessDeniedWidget

function defineWidgetConfig(config: { zone: string[] }) {
  return config
}
 