import { useEffect } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

const REDIRECT_URL = "/app/access"

const OrderWidget = () => {
  const checkUnlockStatus = async () => {
    try {
      const res = await fetch("/admin/unlock-access", {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json()
      console.log("Unlock check:", data)

      if (data?.userId == null) {
        window.location.href = REDIRECT_URL
      }
    } catch (error) {
      console.error("Failed to check unlock status:", error)
      window.location.href = REDIRECT_URL
    }
  }

  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `a[href="/app/access"] {
                          display: none !important; 
                      }
                        a[href="/app/products/create"] {
                          pointer-events: none;  
                          opacity: 0.5;        
                          cursor: not-allowed;
                      }`
    document.head.appendChild(style)
    checkUnlockStatus()
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: [
    "order.list.before",
    "product.list.before",
    "campaign.list.before",
    "customer.list.before",
    "customer_group.list.before",
    "inventory_item.list.before",
    "price_list.list.before",
    "product_variant.details.before",
    "product_collection.list.before",
    "product_category.list.before",
    "promotion.list.before",
    "api_key.list.before",
    "location.list.before",
    "profile.details.before",
    "region.list.before",
    "reservation.list.before",
    "return_reason.list.before",
    "sales_channel.list.before",
    "shipping_profile.list.before",
    "store.details.before",
    "tax.list.before",
    "user.list.before",
    "workflow.list.before"
  ],
})

export default OrderWidget
