import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Container, Heading, Input, Button, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

const CustomPage = () => {
    const [passcode, setPasscode] = useState("")
    const [isVerified, setIsVerified] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            const style = document.createElement('style');
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
    #medusa > div > div > div.flex.h-screen.w-full.flex-col.overflow-auto > div{
        display: none !important;
    }
`;
            document.head.appendChild(style);

            document.head.appendChild(style);
        }, 1);

        return () => clearTimeout(timer);
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        // Check if passcode is correct
        if (passcode === "1234") {
            try {
                // Make API call to unlock user access
                const response = await fetch('/admin/unlock-access', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ passcode })
                })

                if (response.ok) {
                    setIsVerified(true)
                    setTimeout(() => {
                        window.location.href = '/app/orders'
                    }, 1500)
                } else {
                    setError("Failed to unlock access. Please try again.")
                }
            } catch (err) {
                setError("Network error. Please try again.")
            }
        } else {
            setError("Invalid passcode. Please try again.")
        }

        setIsLoading(false)
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
                        <div className="text-center space-y-2">
                            <Text className="text-gray-600">
                                Please enter the access code to unlock full admin privileges
                            </Text>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
                                    Access Code
                                </label>
                                <Input
                                    id="passcode"
                                    type="password"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    placeholder="Enter 4-digit code"
                                    maxLength={4}
                                    className="w-full text-center text-lg tracking-widest"
                                    autoFocus
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || passcode.length !== 4}
                            >
                                {isLoading ? "Verifying..." : "Unlock Access"}
                            </Button>
                        </form>

                        <div className="text-center">
                            <Text className="text-xs text-gray-500">
                                Contact your administrator if you don't have the access code
                            </Text>
                        </div>
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