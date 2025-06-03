import { useState } from 'react'

function ConsultantMatch({ token }) {
    const [formData, setFormData] = useState({
        skills: '',
        domain: '',
        timeline: {
            start: '',
            end: ''
        }
    })
    const [matches, setMatches] = useState([])
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:3000/api/auth/consultant-match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    skills: formData.skills.split(',').map(skill => skill.trim())
                })
            })
            const data = await response.json()
            if (response.ok) {
                setMatches(data.matches)
                setError('')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to find matches')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === 'start' || name === 'end') {
            setFormData(prev => ({
                ...prev,
                timeline: {
                    ...prev.timeline,
                    [name]: value
                }
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const getScoreColor = (score) => {
        if (score >= 4) return 'bg-green-500'
        if (score >= 2) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Find Your Perfect Consultant</h2>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="mb-12 bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="skills">
                            Required Skills
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                            id="skills"
                            name="skills"
                            type="text"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="React, Node.js, MongoDB"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="domain">
                            Domain
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                            id="domain"
                            name="domain"
                            type="text"
                            value={formData.domain}
                            onChange={handleChange}
                            placeholder="Web Development"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start">
                            Start Date
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                            id="start"
                            name="start"
                            type="date"
                            value={formData.timeline.start}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end">
                            End Date
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                            id="end"
                            name="end"
                            type="date"
                            value={formData.timeline.end}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="flex items-center justify-center mt-6">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-200"
                        type="submit"
                    >
                        Find Matches
                    </button>
                </div>
            </form>

            {matches.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Matching Consultants</h3>
                    <div className="space-y-6">
                        {matches.map((match, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:scale-102 duration-200">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                                            <div className="flex items-center space-x-3">
                                                <div className={`${getScoreColor(match.score)} text-white px-4 py-2 rounded-full font-bold`}>
                                                    Score: {match.score}
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-800">{match.name}</h4>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Available: {new Date(match.availableFrom).toLocaleDateString()} - {new Date(match.availableTo).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4">{match.email}</p>

                                    <div className="mb-4">
                                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-2">
                                            {match.domain}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Matched Skills:</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {match.skills.map((skill, skillIndex) => (
                                                <span key={skillIndex} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700 italic">{match.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ConsultantMatch 