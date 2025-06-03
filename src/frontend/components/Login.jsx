import { useState } from 'react'

function Login({ onLogin }) {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [error, setError] = useState('')

    const handleGenerateOTP = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:3000/api/auth/generate-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })
            const data = await response.json()
            if (response.ok) {
                setShowOtpInput(true)
                setError('')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to generate OTP')
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            })
            const data = await response.json()
            if (response.ok) {
                onLogin(data.token)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to verify OTP')
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
                <div className="flex items-center justify-center">
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