// import { defineRouteConfig } from "@medusajs/admin-sdk"
// import { ChatBubbleLeftRight } from "@medusajs/icons"
// import { Container, Heading, Input, Button, Text } from "@medusajs/ui"
// import { useEffect, useState } from "react"

// const CustomPage = () => {
//     const [passcode, setPasscode] = useState("")
//     const [isVerified, setIsVerified] = useState(false)
//     const [error, setError] = useState("")
//     const [isLoading, setIsLoading] = useState(false)
//     const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

//     useEffect(() => {
//         const fetchQrCode = async () => {
//             try {
//                 const response = await fetch("/admin/generate-qr")
//                 if (!response.ok) {
//                     throw new Error(`Failed to fetch QR code: ${response.status}`)
//                 }
//                 const data = await response.json()
//                 setQrCodeUrl(data.qrCodeImageUrl)
//             } catch (err) {
//                 console.error("Error fetching QR code:", err)
//                 setError("Failed to load QR code. Please refresh the page.")
//             }
//         }

//         fetchQrCode()

//         const timer = setTimeout(() => {
//             const style = document.createElement("style")
//             style.innerHTML = `
//                 [role="dialog"] {
//                     display: none !important;
//                     visibility: hidden !important;
//                     opacity: 0 !important;
//                     pointer-events: none !important;
//                 }
//                 #medusa > div > div > div:nth-child(2) > div {
//                     display: none !important;
//                 }
//                 #medusa > div > div > div.flex.h-screen.w-full.flex-col.overflow-auto > div {
//                     display: none !important;
//                 }
//             `
//             document.head.appendChild(style)
//         }, 1)

//         return () => clearTimeout(timer)
//     }, [])

//     const verifyMfaAndUnlockAccess = async (e: React.FormEvent) => {
//         e.preventDefault()
//         setIsLoading(true)
//         setError("")

//         try {
//             const mfaResponse = await fetch("/admin/verify-code", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ passcode }),
//             })

//             const mfaData = await mfaResponse.json()
//             console.log("MFA Response:", mfaData)

//             if (!mfaResponse.ok) {
//                 switch (mfaData.error) {
//                     case "NO_SESSION":
//                     case "NO_MFA_SECRET":
//                         setError("Session expired. Please refresh the page and try again.")
//                         break
//                     case "MISSING_PASSCODE":
//                         setError("Please enter a passcode.")
//                         break
//                     case "INVALID_PASSCODE_FORMAT":
//                         setError("Passcode must be exactly 6 digits.")
//                         break
//                     case "INVALID_MFA_CODE":
//                         setError("Invalid or expired code. Please try again.")
//                         break
//                     case "MISSING_BODY":
//                         setError("Request error. Please try again.")
//                         break
//                     default:
//                         setError(`${mfaData.message || "MFA verification failed."}`)
//                 }
//                 setIsLoading(false)
//                 return
//             }

//             const unlockResponse = await fetch("/admin/unlock-access", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//             })

//             if (unlockResponse.ok) {
//                 setIsVerified(true)
//                 setTimeout(() => {
//                     window.location.href = "/app/orders"
//                 }, 1500)
//             } else {
//                 const unlockData = await unlockResponse.json()
//                 setError(`${unlockData.message || "Failed to unlock access."}`)
//             }
//         } catch (err) {
//             console.error("Network error:", err)
//             setError("Network error. Please check your connection and try again.")
//         }

//         setIsLoading(false)
//     }

//     const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const value = e.target.value.replace(/\D/g, '')
//         setPasscode(value)
//         if (error) setError("") 
//     }

//     if (isVerified) {
//         return (
//             <Container className="divide-y p-0">
//                 <div className="flex items-center justify-center px-6 py-12">
//                     <div className="text-center space-y-4">
//                         <div className="text-green-600 text-6xl">✓</div>
//                         <Heading level="h2" className="text-green-600">Access Granted!</Heading>
//                         <Text className="text-gray-600">
//                             You now have full access to the admin panel. Redirecting...
//                         </Text>
//                     </div>
//                 </div>
//             </Container>
//         )
//     }

//     return (
//         <Container className="divide-y p-0">
//             <div className="flex items-center justify-between px-6 py-4">
//                 <Heading level="h2">Access Verification Required</Heading>
//             </div>

//             <div className="px-6 py-8">
//                 <div className="max-w-md mx-auto">
//                     <div className="space-y-6">
//                         {qrCodeUrl && (
//                             <div className="text-center">
//                                 <Text className="mb-2 font-medium">Scan this QR code to set up MFA</Text>
//                                 <img
//                                     src={qrCodeUrl}
//                                     alt="MFA QR Code"
//                                     className="mx-auto max-w-[200px] border p-2 rounded-lg shadow"
//                                 />
//                                 <Text className="text-xs text-gray-500 mt-2">
//                                     Use Google Authenticator, Authy, or any TOTP app
//                                 </Text>
//                             </div>
//                         )}

//                         <div className="text-center space-y-2">
//                             <Text className="text-gray-600">
//                                 Enter your 6-digit access code to unlock admin privileges
//                             </Text>
//                         </div>

//                         <form onSubmit={verifyMfaAndUnlockAccess} className="space-y-4">
//                             <div>
//                                 <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
//                                     Access Code
//                                 </label>
//                                 <Input
//                                     id="passcode"
//                                     type="text"
//                                     inputMode="numeric"
//                                     pattern="[0-9]*"
//                                     value={passcode}
//                                     onChange={handlePasscodeChange}
//                                     placeholder="Enter 6-digit code"
//                                     maxLength={6}
//                                     className="w-full text-center text-lg tracking-widest"
//                                     autoComplete="off"
//                                     autoFocus
//                                     required
//                                 />
//                             </div>

//                             {error && (
//                                 <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
//                                     {error}
//                                 </div>
//                             )}

//                             <Button
//                                 type="submit"
//                                 className="w-full"
//                                 disabled={isLoading || passcode.length !== 6}
//                             >
//                                 {isLoading ? "Verifying..." : "Verify & Unlock Access"}
//                             </Button>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </Container>
//     )
// }

// export const config = defineRouteConfig({
//     label: "Access Verification",
//     icon: ChatBubbleLeftRight,
// })

// export default CustomPage




import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Container, Heading, Input, Button, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

const CustomPage = () => {
    const [passcode, setPasscode] = useState("")
    const [isVerified, setIsVerified] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [isGeneratingQR, setIsGeneratingQR] = useState(true)

    const fetchQrCode = async (retryCount = 0) => {
        try {
            setIsGeneratingQR(true)
            const response = await fetch("/admin/generate-qr", {
                credentials: 'same-origin', // Ensure cookies are sent
            })
            
            if (!response.ok) {
                throw new Error(`Failed to fetch QR code: ${response.status}`)
            }
            
            const data = await response.json()
            setQrCodeUrl(data.qrCodeImageUrl)
            setError("")
        } catch (err) {
            console.error("Error fetching QR code:", err)
            
            // Retry up to 2 times with delay
            if (retryCount < 2) {
                setTimeout(() => {
                    fetchQrCode(retryCount + 1)
                }, 1000 * (retryCount + 1)) // Exponential backoff
            } else {
                setError("Failed to load QR code. Please refresh the page.")
            }
        } finally {
            setIsGeneratingQR(false)
        }
    }

    useEffect(() => {
        fetchQrCode()

        const timer = setTimeout(() => {
            const style = document.createElement("style")
            style.innerHTML = `
                [role="dialog"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
                #medusa > div > div > div:nth-child(2) > div {
                    display: none !important;
                }
                #medusa > div > div > div.flex.h-screen.w-full.flex-col.overflow-auto > div {
                    display: none !important;
                }
            `
            document.head.appendChild(style)
        }, 1)

        return () => clearTimeout(timer)
    }, [])

    const verifyMfaAndUnlockAccess = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const mfaResponse = await fetch("/admin/verify-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'same-origin', // Ensure cookies are sent
                body: JSON.stringify({ passcode }),
            })

            const mfaData = await mfaResponse.json()
            console.log("MFA Response:", mfaData)

            if (!mfaResponse.ok) {
                switch (mfaData.error) {
                    case "NO_SESSION":
                        setError("Session expired. Please refresh the page and try again.")
                        break
                    case "NO_MFA_SECRET":
                        setError("MFA setup expired. Please refresh the page to generate a new QR code.")
                        // Optionally refresh QR code automatically
                        setTimeout(() => {
                            fetchQrCode()
                        }, 2000)
                        break
                    case "MISSING_PASSCODE":
                        setError("Please enter a passcode.")
                        break
                    case "INVALID_PASSCODE_FORMAT":
                        setError("Passcode must be exactly 6 digits.")
                        break
                    case "INVALID_MFA_CODE":
                        setError("Invalid or expired code. Please try again.")
                        break
                    case "MISSING_BODY":
                        setError("Request error. Please try again.")
                        break
                    default:
                        setError(`${mfaData.message || "MFA verification failed."}`)
                }
                setIsLoading(false)
                return
            }

            const unlockResponse = await fetch("/admin/unlock-access", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'same-origin',
            })

            if (unlockResponse.ok) {
                setIsVerified(true)
                setTimeout(() => {
                    window.location.href = "/app/orders"
                }, 1500)
            } else {
                const unlockData = await unlockResponse.json()
                setError(`${unlockData.message || "Failed to unlock access."}`)
            }
        } catch (err) {
            console.error("Network error:", err)
            setError("Network error. Please check your connection and try again.")
        }

        setIsLoading(false)
    }

    const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '')
        setPasscode(value)
        if (error) setError("") 
    }

    const handleRefreshQR = () => {
        setQrCodeUrl(null)
        fetchQrCode()
    }

    if (isVerified) {
        return (
            <Container className="divide-y p-0">
                <div className="flex items-center justify-center px-6 py-12">
                    <div className="text-center space-y-4">
                        <div className="text-green-600 text-6xl">✓</div>
                        <Heading level="h2" className="text-green-600">Access Granted!</Heading>
                        <Text className="text-gray-600">
                            You now have full access to the admin panel. Redirecting...
                        </Text>
                    </div>
                </div>
            </Container>
        )
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Access Verification Required</Heading>
            </div>

            <div className="px-6 py-8">
                <div className="max-w-md mx-auto">
                    <div className="space-y-6">
                        {isGeneratingQR ? (
                            <div className="text-center">
                                <Text className="mb-2">Generating QR code...</Text>
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            </div>
                        ) : qrCodeUrl ? (
                            <div className="text-center">
                                <Text className="mb-2 font-medium">Scan this QR code to set up MFA</Text>
                                <img
                                    src={qrCodeUrl}
                                    alt="MFA QR Code"
                                    className="mx-auto max-w-[200px] border p-2 rounded-lg shadow"
                                />
                                <Text className="text-xs text-gray-500 mt-2">
                                    Use Google Authenticator, Authy, or any TOTP app
                                </Text>
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={handleRefreshQR}
                                    className="mt-2"
                                >
                                    Refresh QR Code
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Text className="text-red-600 mb-2">Failed to generate QR code</Text>
                                <Button
                                    variant="secondary"
                                    onClick={handleRefreshQR}
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}

                        <div className="text-center space-y-2">
                            <Text className="text-gray-600">
                                Enter your 6-digit access code to unlock admin privileges
                            </Text>
                        </div>

                        <form onSubmit={verifyMfaAndUnlockAccess} className="space-y-4">
                            <div>
                                <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
                                    Access Code
                                </label>
                                <Input
                                    id="passcode"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={passcode}
                                    onChange={handlePasscodeChange}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    className="w-full text-center text-lg tracking-widest"
                                    autoComplete="off"
                                    autoFocus
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || passcode.length !== 6 || !qrCodeUrl}
                            >
                                {isLoading ? "Verifying..." : "Verify & Unlock Access"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Access Verification",
    icon: ChatBubbleLeftRight,
})

export default CustomPage




