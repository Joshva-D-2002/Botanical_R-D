import React, { useEffect, useState } from "react";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
 
const SidebarPermissionWidget = () => {
    const [userEmail, setUserEmail] = useState<string>("");
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [permissionApplied, setPermissionApplied] = useState(false);
 
    useEffect(() => {
        // Check user info only once when component mounts
        fetchUserInfo();
    }, []);
 
    const fetchUserInfo = async () => {
        try {
            const response = await fetch('/admin/users/me', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });
 
            if (response.ok) {
                const data = await response.json();
                const email = data.user?.email;
                const userId = data.user?.id;
 
                console.log('Fetched user email:', email, 'ID:', userId);
 
                if (email) {
                    setUserEmail(email);
                    const permissions = getPermissionsByEmail(email);
                    setUserPermissions(permissions);
                }
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };
 
    const getPermissionsByEmail = (email: string): string[] => {
        const EMAIL_PERMISSIONS: Record<string, string[]> = {
            "usera@example.com": ["products"],
            "userb@example.com": ["orders"],
        };
        return EMAIL_PERMISSIONS[email] || ["all"];
    };
 
    useEffect(() => {
        if (!userEmail || userPermissions.length === 0 || permissionApplied) return;
 
        const waitForSidebar = setInterval(() => {
            const sidebarReady = document.querySelector('aside');
            if (sidebarReady) {
                clearInterval(waitForSidebar);
                applySidebarPermissions();
                setIsReady(true);
                setPermissionApplied(true); // ✅ prevent repeat
                setupObserver();
                handleUserRedirection();
            }
        }, 300);
 
        return () => clearInterval(waitForSidebar);
    }, [userEmail, permissionApplied]);
 
    const handleUserRedirection = () => {
        if (userPermissions.includes("all")) return;
 
        const currentPath = window.location.pathname.toLowerCase();
 
        const userDefaultRoutes: Record<string, string> = {
            "usera@example.com": "/app/products",
            "userb@example.com": "/app/orders"
        };
 
        // ✅ Updated to be more specific about restricted routes
        const restrictedRoutes: Record<string, string[]> = {
            "usera@example.com": ["/app/orders", "/app/inventory", "/app/customers", "/app/settings"],
            "userb@example.com": ["/app/products", "/app/collections", "/app/categories", "/app/settings"]
        };
 
        const defaultRoute = userDefaultRoutes[userEmail];
        const userRestrictedRoutes = restrictedRoutes[userEmail] || [];
 
        // ✅ Check if current path starts with any restricted route
        const isOnRestrictedRoute = userRestrictedRoutes.some(route =>
            currentPath.startsWith(route.toLowerCase())
        );
 
        const shouldRedirect = isOnRestrictedRoute ||
            (defaultRoute && !currentPath.startsWith(defaultRoute.toLowerCase()) && currentPath !== '/app' && currentPath !== '/app/');
 
        if (shouldRedirect && defaultRoute) {
            console.log(`Redirecting ${userEmail} to ${defaultRoute}`);
            setTimeout(() => {
                window.location.href = defaultRoute;
            }, 500);
        }
    };
 
    const applySidebarPermissions = () => {
        if (!userPermissions || userPermissions.includes("all")) {
            console.log("Full access - skipping permission filtering");
            return;
        }
 
        const sidebar = document.querySelector('aside');
        if (!sidebar) {
            console.warn("Sidebar not found");
            return;
        }
 
        // ✅ Updated to include more specific product-related routes
        const allowedSections = {
            products: [
                "product", "products", "collections", "categories",
                "import", "export", // Add these keywords
                "/app/products/import", "/app/products/export" // Add specific routes
            ],
            orders: ["order", "orders"],
            // customers: ["customer", "customers"],
            // inventory: ["inventory", "stock"]
        };
 
        const navLinks = sidebar.querySelectorAll("a");
 
        navLinks.forEach((el) => {
            const text = el.textContent?.toLowerCase().trim() ?? "";
            const href = (el as HTMLAnchorElement).href?.toLowerCase() || "";
 
            let isAllowed = false;
 
            // Check if this element should be shown based on user permissions
            Object.entries(allowedSections).forEach(([section, keywords]) => {
                if (userPermissions.includes(section)) {
                    keywords.forEach((keyword) => {
                        if (text.includes(keyword) || href.includes(keyword)) {
                            isAllowed = true;
                        }
                    });
                }
            });
 
            // ✅ Additional check for product sub-routes
            if (!isAllowed && userPermissions.includes("products")) {
                // Allow access to any route that starts with /app/products
                if (href.includes("/app/products")) {
                    isAllowed = true;
                }
            }
 
            // Hide elements that are not allowed
            if (!isAllowed) {
                hideElement(el as HTMLElement);
            }
        });
 
        console.log("Sidebar permissions applied for", userEmail, "with permissions:", userPermissions);
    };
 
    const hideElement = (element: HTMLElement) => {
        if (element) {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
 
            // Also hide parent li if it exists
            const parentLi = element.closest('li');
            if (parentLi && parentLi !== element) {
                (parentLi as HTMLElement).style.display = 'none';
                (parentLi as HTMLElement).style.visibility = 'hidden';
            }
        }
    };
 
    const showElement = (element: HTMLElement) => {
        if (element) {
            element.style.display = '';
            element.style.visibility = '';
 
            // Also show parent li if it exists
            const parentLi = element.closest('li');
            if (parentLi && parentLi !== element) {
                (parentLi as HTMLElement).style.display = '';
                (parentLi as HTMLElement).style.visibility = '';
            }
        }
    };
 
    const setupObserver = () => {
        const sidebar = document.querySelector('aside nav');
        if (!sidebar || userPermissions.includes("all")) return;
 
        const observer = new MutationObserver(() => {
            console.log("Sidebar changed, reapplying permissions...");
            setTimeout(applySidebarPermissions, 100);
        });
 
        observer.observe(sidebar, {
            childList: true,
            subtree: true,
        });
 
        // Store observer reference for cleanup if needed
        return observer;
    };
 
    console.log('Widget Status - Email:', userEmail, 'Permissions:', userPermissions, 'Ready:', isReady);
 
    return null;
};
 
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
        "workflow.list.before",
    ],
});
 
export default SidebarPermissionWidget;
 