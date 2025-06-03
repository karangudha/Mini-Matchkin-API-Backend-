import { useState } from 'react'
import Login from './components/Login'
import ConsultantMatch from './components/ConsultantMatch'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [token, setToken] = useState('')

    const handleLogin = (newToken) => {
        setToken(newToken)
        setIsLoggedIn(true)
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    {!isLoggedIn ? (
                        <Login onLogin={handleLogin} />
                    ) : (
                        <ConsultantMatch token={token} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default App 