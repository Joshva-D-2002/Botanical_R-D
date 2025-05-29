"use client"

import { useState } from "react"
import { sdk } from "@/lib/sdk"
import { useRouter } from "next/navigation"

export default function Login() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault()
        if (!email || !password) return

        setLoading(true)

        let token: string | { location: string }

        try {
            token = await sdk.auth.login("customer", "emailpass", {
                email,
                password,
            })
        } catch (error) {
            alert(`An error occurred while logging in: ${error}`)
            setLoading(false)
            return
        }

        if (typeof token !== "string") {
            alert("Authentication requires more actions, which isn't supported by this flow.")
            setLoading(false)
            return
        }

        try {
            const { customer } = await sdk.store.customer.retrieve()
            console.log("Logged in customer:", customer)
            router.push("/verify")
        } catch (err) {
            console.error("Failed to fetch customer:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <form style={styles.form}>
                <h2 style={styles.heading}>Login</h2>
                <input
                    type="email"
                    name="email"
                    value={email}
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="password"
                    name="password"
                    value={password}
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />
                <button
                    disabled={loading}
                    onClick={handleLogin}
                    style={{
                        ...styles.button,
                        backgroundColor: loading ? "#999" : "#0070f3",
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    )
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "black",
    },
    form: {
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    heading: {
        fontSize: "1.5rem",
        marginBottom: "1rem",
        textAlign: "center",
        color: "blue",
    },
    input: {
        padding: "0.75rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "1rem",
    },
    button: {
        padding: "0.75rem",
        color: "#fff",
        fontWeight: "bold",
        border: "none",
        borderRadius: "4px",
        transition: "background-color 0.3s",
    },
}
