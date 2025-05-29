"use client"

import Link from "next/link"
import { useState } from "react"
import { sdk } from "../../lib/sdk"
import { FetchError } from "@medusajs/js-sdk"

export default function Register() {
    const [loading, setLoading] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegistration = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault()
        if (!firstName || !lastName || !email || !password) return
        setLoading(true)

        try {
            await sdk.auth.register("customer", "emailpass", {
                email,
                password,
            })
        } catch (error) {
            const fetchError = error as FetchError

            if (
                fetchError.statusText !== "Unauthorized" ||
                fetchError.message !== "Identity with email already exists"
            ) {
                alert(`An error occurred while creating account: ${fetchError}`)
                setLoading(false)
                return
            }

            const loginResponse = await sdk.auth
                .login("customer", "emailpass", {
                    email,
                    password,
                })
                .catch((e) => {
                    alert(`An error occurred while creating account: ${e}`)
                })

            if (!loginResponse || typeof loginResponse !== "string") {
                alert("Login step failed.")
                setLoading(false)
                return
            }
        }

        try {
            const { customer } = await sdk.store.customer.create({
                first_name: firstName,
                last_name: lastName,
                email,
            })

            console.log(customer)
        } catch (error) {
            console.error(error)
            alert("Error: " + error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <form style={styles.form}>
                <h2 style={styles.heading}>Register</h2>

                <input
                    type="text"
                    name="first_name"
                    value={firstName}
                    placeholder="First Name"
                    onChange={(e) => setFirstName(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="text"
                    name="last_name"
                    value={lastName}
                    placeholder="Last Name"
                    onChange={(e) => setLastName(e.target.value)}
                    style={styles.input}
                />
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
                    onClick={handleRegistration}
                    style={{
                        ...styles.button,
                        backgroundColor: loading ? "#999" : "#10b981",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <p style={styles.linkText}>
                    Already have an account?{" "}
                    <Link href="/login" style={styles.link}>
                        Login
                    </Link>
                </p>
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
        backgroundColor: "#f4f4f4",
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
        color: "#333",
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
    linkText: {
        marginTop: "1rem",
        fontSize: "0.9rem",
        textAlign: "center",
    },
    link: {
        color: "#0070f3",
        textDecoration: "none",
    },
}
