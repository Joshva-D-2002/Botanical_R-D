"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to the Home Page!</h1>

      <div style={styles.buttonGroup}>
        <button style={{ ...styles.button, ...styles.login }} onClick={() => router.push("/login")}>
          Login
        </button>

        <button style={{ ...styles.button, ...styles.register }} onClick={() => router.push("/register")}>
          Register
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "24px",
    backgroundColor: "black",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "24px",
    color: "blue",
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
  },
  button: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "6px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  login: {
    backgroundColor: "#2563eb", // blue
  },
  register: {
    backgroundColor: "#16a34a", // green
  },
};
