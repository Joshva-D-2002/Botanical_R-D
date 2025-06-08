import { useEffect, useRef } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useSignInWithEmailPass } from "../../hooks/auth"
import { isFetchError } from "../../lib/is-fetch-error"

const REDIRECT_URL = "/app/access"

const OrderWidget = () => {
    const interceptedRef = useRef(false)
    const { mutateAsync } = useSignInWithEmailPass()

    const setFormError = (form: HTMLFormElement, field: string, message: string) => {
        const input = form.querySelector(`input[name="${field}"]`) as HTMLInputElement
        if (!input) return

        const existingError = form.querySelector(`[data-error-for="${field}"]`)
        if (existingError) {
            existingError.remove()
        }

        const errorDiv = document.createElement('div')
        errorDiv.setAttribute('data-error-for', field)
        errorDiv.className = 'text-center'
        errorDiv.innerHTML = `<div class="inline-flex text-ui-fg-error text-sm">${message}</div>`

        const inputContainer = input.closest('.flex.flex-col.gap-y-1') || input.parentElement
        if (inputContainer && inputContainer.parentElement) {
            inputContainer.parentElement.insertBefore(errorDiv, inputContainer.nextSibling)
        }

        input.classList.add('border-ui-border-error')
    }

    const clearFormErrors = (form: HTMLFormElement) => {
        const errorElements = form.querySelectorAll('[data-error-for]')
        errorElements.forEach(el => el.remove())
        const inputs = form.querySelectorAll('input')
        inputs.forEach(input => {
            input.classList.remove('border-ui-border-error')
        })
    }

    useEffect(() => {
        if (interceptedRef.current) return

        const interceptSubmit = () => {
            const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement | null
            const form = document.querySelector('form') as HTMLFormElement | null

            if (submitButton && form && !interceptedRef.current) {
                interceptedRef.current = true

                const originalClickHandler = (e: Event) => {
                    e.preventDefault()
                    e.stopPropagation()

                    clearFormErrors(form)

                    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement
                    const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement

                    const email = emailInput?.value
                    const password = passwordInput?.value

                    if (!email || !password) {
                        submitButton.removeEventListener('click', originalClickHandler)
                        submitButton.click()
                        return
                    }

                    performLogin(email, password, form, submitButton, originalClickHandler)
                }

                submitButton.addEventListener('click', originalClickHandler, true)
            }
        }

        const performLogin = async (
            email: string, 
            password: string, 
            form: HTMLFormElement,
            submitButton: HTMLButtonElement,
            originalHandler: (e: Event) => void
        ) => {
            try {
                submitButton.disabled = true
                submitButton.textContent = 'Signing in...'

                await mutateAsync(
                    { email, password },
                    {
                        onError: (error) => {
                            console.error('Login error:', error)

                            submitButton.disabled = false
                            submitButton.textContent = 'Continue with Email'

                            if (isFetchError(error)) {
                                if (error.status === 401) {
                                    setFormError(form, 'email', error.message)
                                    return
                                }
                            }

                            setFormError(form, 'email', error.message || 'Login failed')

                            submitButton.removeEventListener('click', originalHandler)
                        },
                        onSuccess: () => {
                            // Login successful, redirect directly to access page
                            window.location.href = REDIRECT_URL
                        }
                    }
                )
            } catch (error: any) {
                console.error('Login error:', error)

                submitButton.disabled = false
                submitButton.textContent = 'Continue with Email'

                setFormError(form, 'email', error.message || 'Login failed')

                submitButton.removeEventListener('click', originalHandler)
            }
        }

        // Use MutationObserver to catch the form when it loads
        const observer = new MutationObserver(() => {
            interceptSubmit()
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })

        // Try immediately in case form is already loaded
        setTimeout(interceptSubmit, 1000)

        return () => {
            observer.disconnect()
        }
    }, [mutateAsync])

    return null
}

export const config = defineWidgetConfig({
    zone: ["login.after"],
})

export default OrderWidget



// import { useEffect, useRef } from "react"
// import { defineWidgetConfig } from "@medusajs/admin-sdk"
// import { useSignInWithEmailPass } from "../../hooks/auth"
// import { isFetchError } from "../../lib/is-fetch-error"

// const REDIRECT_URL = "/app/access"

// const OrderWidget = () => {
//     const interceptedRef = useRef(false)
//     const { mutateAsync } = useSignInWithEmailPass()

//     const setFormError = (form: HTMLFormElement, field: string, message: string) => {
//         const input = form.querySelector(`input[name="${field}"]`) as HTMLInputElement
//         if (!input) return

//         const existingError = form.querySelector(`[data-error-for="${field}"]`)
//         if (existingError) {
//             existingError.remove()
//         }

//         const errorDiv = document.createElement('div')
//         errorDiv.setAttribute('data-error-for', field)
//         errorDiv.className = 'text-center'
//         errorDiv.innerHTML = `<div class="inline-flex text-ui-fg-error text-sm">${message}</div>`

//         const inputContainer = input.closest('.flex.flex-col.gap-y-1') || input.parentElement
//         if (inputContainer && inputContainer.parentElement) {
//             inputContainer.parentElement.insertBefore(errorDiv, inputContainer.nextSibling)
//         }

//         input.classList.add('border-ui-border-error')
//     }

//     const clearFormErrors = (form: HTMLFormElement) => {
//         const errorElements = form.querySelectorAll('[data-error-for]')
//         errorElements.forEach(el => el.remove())
//         const inputs = form.querySelectorAll('input')
//         inputs.forEach(input => {
//             input.classList.remove('border-ui-border-error')
//         })
//     }

//     // Create and show a full-screen loader
//     const showRedirectLoader = () => {
//         // Remove any existing loader
//         const existingLoader = document.getElementById('redirect-loader')
//         if (existingLoader) {
//             existingLoader.remove()
//         }

//         const loader = document.createElement('div')
//         loader.id = 'redirect-loader'
//         loader.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background: rgba(255, 255, 255, 0.9);
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             z-index: 9999;
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//         `

//         loader.innerHTML = `
//             <div style="
//                 width: 40px;
//                 height: 40px;
//                 border: 4px solid #f3f4f6;
//                 border-top: 4px solid #3b82f6;
//                 border-radius: 50%;
//                 animation: spin 1s linear infinite;
//                 margin-bottom: 16px;
//             "></div>
//             <div style="
//                 color: #6b7280;
//                 font-size: 16px;
//                 font-weight: 500;
//             ">Redirecting to access page...</div>
//             <style>
//                 @keyframes spin {
//                     0% { transform: rotate(0deg); }
//                     100% { transform: rotate(360deg); }
//                 }
//             </style>
//         `

//         document.body.appendChild(loader)
//     }

//     // Alternative: Create a simple overlay loader
//     const showSimpleLoader = () => {
//         const existingLoader = document.getElementById('simple-loader')
//         if (existingLoader) {
//             existingLoader.remove()
//         }

//         const loader = document.createElement('div')
//         loader.id = 'simple-loader'
//         loader.style.cssText = `
//             position: fixed;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             background: white;
//             padding: 20px 30px;
//             border-radius: 8px;
//             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//             z-index: 9999;
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//         `

//         loader.innerHTML = `
//             <div style="
//                 width: 20px;
//                 height: 20px;
//                 border: 2px solid #f3f4f6;
//                 border-top: 2px solid #3b82f6;
//                 border-radius: 50%;
//                 animation: spin 1s linear infinite;
//             "></div>
//             <span style="color: #374151; font-size: 14px;">Redirecting...</span>
//             <style>
//                 @keyframes spin {
//                     0% { transform: rotate(0deg); }
//                     100% { transform: rotate(360deg); }
//                 }
//             </style>
//         `

//         document.body.appendChild(loader)
//     }

//     useEffect(() => {
//         if (interceptedRef.current) return

//         // Monitor location changes and show loader when navigating to /app/access
//         const monitorLocationChanges = () => {
//             // Override window.location.href setter
//             const originalLocationHref = window.location.href
//             let currentHref = originalLocationHref

//             // Monitor for programmatic navigation
//             const checkLocationChange = () => {
//                 if (window.location.href !== currentHref) {
//                     currentHref = window.location.href
//                     if (currentHref.includes('/app/access')) {
//                         showRedirectLoader()
//                     }
//                 }
//             }

//             // Check for location changes periodically
//             const locationInterval = setInterval(checkLocationChange, 100)

//             // Listen for popstate events (browser back/forward)
//             const handlePopState = () => {
//                 if (window.location.pathname === '/app/access') {
//                     showRedirectLoader()
//                 }
//             }
//             window.addEventListener('popstate', handlePopState)

//             // Override history methods
//             const originalPushState = history.pushState
//             const originalReplaceState = history.replaceState

//             history.pushState = function (state, title, url) {
//                 if (url && url.toString().includes('/app/access')) {
//                     showRedirectLoader()
//                 }
//                 return originalPushState.apply(history, [...arguments] as [any, string, (string | URL | null | undefined)?])
//             }

//             history.replaceState = function (state, title, url) {
//                 if (url && url.toString().includes('/app/access')) {
//                     showRedirectLoader()
//                 }
//                 return originalReplaceState.apply(history, [...arguments] as [any, string, (string | URL | null | undefined)?])
//             }

//             return () => {
//                 clearInterval(locationInterval)
//                 window.removeEventListener('popstate', handlePopState)
//                 history.pushState = originalPushState
//                 history.replaceState = originalReplaceState
//             }
//         }

//         const locationCleanup = monitorLocationChanges()

//         const interceptSubmit = () => {
//             const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement | null
//             const form = document.querySelector('form') as HTMLFormElement | null

//             if (submitButton && form && !interceptedRef.current) {
//                 interceptedRef.current = true

//                 const originalClickHandler = (e: Event) => {
//                     e.preventDefault()
//                     e.stopPropagation()

//                     clearFormErrors(form)

//                     const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement
//                     const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement

//                     const email = emailInput?.value
//                     const password = passwordInput?.value

//                     if (!email || !password) {
//                         submitButton.removeEventListener('click', originalClickHandler)
//                         submitButton.click()
//                         return
//                     }

//                     performLogin(email, password, form, submitButton, originalClickHandler)
//                 }

//                 submitButton.addEventListener('click', originalClickHandler, true)
//             }
//         }

//         const performLogin = async (
//             email: string,
//             password: string,
//             form: HTMLFormElement,
//             submitButton: HTMLButtonElement,
//             originalHandler: (e: Event) => void
//         ) => {
//             try {
//                 submitButton.disabled = true
//                 submitButton.textContent = 'Signing in...'

//                 await mutateAsync(
//                     { email, password },
//                     {
//                         onError: (error) => {
//                             console.error('Login error:', error)

//                             submitButton.disabled = false
//                             submitButton.textContent = 'Continue with Email'

//                             if (isFetchError(error)) {
//                                 if (error.status === 401) {
//                                     setFormError(form, 'email', error.message)
//                                     return
//                                 }
//                             }

//                             setFormError(form, 'email', error.message || 'Login failed')

//                             submitButton.removeEventListener('click', originalHandler)
//                         },
//                         onSuccess: () => {
//                             // Show loader before redirect
//                             showRedirectLoader() // or showSimpleLoader() for a smaller loader

//                             // Show loader for 3 seconds before redirect
//                             setTimeout(() => {
//                                 window.location.href = REDIRECT_URL
//                             }, 3000)
//                         }
//                     }
//                 )
//             } catch (error: any) {
//                 console.error('Login error:', error)

//                 submitButton.disabled = false
//                 submitButton.textContent = 'Continue with Email'

//                 setFormError(form, 'email', error.message || 'Login failed')

//                 submitButton.removeEventListener('click', originalHandler)
//             }
//         }

//         // Use MutationObserver to catch the form when it loads
//         const observer = new MutationObserver(() => {
//             interceptSubmit()
//         })

//         observer.observe(document.body, {
//             childList: true,
//             subtree: true,
//         })

//         // Try immediately in case form is already loaded
//         setTimeout(interceptSubmit, 1000)

//         return () => {
//             observer.disconnect()
//             locationCleanup() // Clean up location monitoring
//             // Clean up any existing loaders
//             const loader1 = document.getElementById('redirect-loader')
//             const loader2 = document.getElementById('simple-loader')
//             if (loader1) loader1.remove()
//             if (loader2) loader2.remove()
//         }
//     }, [mutateAsync])

//     return null
// }

// export const config = defineWidgetConfig({
//     zone: ["login.after"],
// })

// export default OrderWidget