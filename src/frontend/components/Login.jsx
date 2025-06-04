import { useState, useEffect } from 'react'

function Login({ onLogin }) {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [error, setError] = useState('')
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Check if the user is already logged in
        const checkUser = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    method: 'GET',
                    credentials: 'include', // send cookies
                })

                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        onLogin(); // User is logged in, call the onLogin callback
                    }
                } else {
                    console.error("User check failed:", response.statusText);
                    localStorage.removeItem('isLoggedIn'); // Clear local storage if check fails
                    setError("Failed to check user status.");
                }
            } catch (error) {
                console.error("User check error:", error);
                setError("Unable to check user status.");
            }
        }
        if (localStorage.getItem('isLoggedIn') === 'true') {
            checkUser()
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (localStorage.getItem('isLoggedIn') === 'true') {
                handleRefreshToken();
            }
        }, 4 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);


    const handleGenerateOTP = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const response = await fetch(`${API_URL}/api/auth/generate-otp`, {
                // const response = await fetch(`http://localhost:3000/api/auth/generate-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
                credentials: 'include',
            })
            const data = await response.json()
            if (response.ok) {
                setShowOtpInput(true)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to generate OTP')
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
                credentials: 'include',
            })
            const data = await response.json()
            if (response.ok) {
                localStorage.setItem('isLoggedIn', 'true')
                onLogin()
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to verify OTP')
        }
    }

    const handleRefreshToken = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
                method: 'POST',
                credentials: 'include', // send cookies
            })

            const data = await response.json()

            if (response.ok) {
                console.log("Token refreshed successfully")
                onLogin() // call again if needed
            } else {
                console.error("Refresh failed:", data.message)
                setError("Session expired, please login again.")
                localStorage.removeItem('isLoggedIn') // Clear local storage on failure
            }
        } catch (error) {
            console.error("Refresh error:", error)
            setError("Unable to refresh session.")
        }
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Login</h2>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <form onSubmit={showOtpInput ? handleVerifyOTP : handleGenerateOTP}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {showOtpInput && (
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                            OTP
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                )}
                <div className="flex items-center justify-center gap-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        {showOtpInput ? 'Verify OTP' : 'Generate OTP'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login 