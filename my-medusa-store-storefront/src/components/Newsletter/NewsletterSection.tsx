'use client'

import React, { useState } from 'react'

export default function NewsletterSection() {
    const [email, setEmail] = useState('')
    const [subscribed, setSubscribed] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real implementation, you would send this to your email service
        setSubscribed(true)
        setTimeout(() => {
            setSubscribed(false)
            setEmail('')
        }, 3000)
    }

    return (
        <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="content-container relative z-10">
                <div className="max-w-3xl mx-auto text-center text-white">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-pulse-glow">
                        📧
                    </div>

                    {/* Heading */}
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
                        Stay Updated with Latest Offers
                    </h2>
                    <p className="text-xl text-indigo-100 mb-8 animate-fade-in">
                        Subscribe to our newsletter and get exclusive deals, new arrivals, and special promotions delivered to your inbox.
                    </p>

                    {/* Newsletter Form */}
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto animate-scale-in">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-200 shadow-xl hover:shadow-2xl whitespace-nowrap"
                            >
                                Subscribe Now
                            </button>
                        </div>

                        {/* Success Message */}
                        {subscribed && (
                            <div className="mt-4 p-4 bg-green-500 text-white rounded-lg animate-fade-in font-semibold">
                                ✓ Thank you for subscribing! Check your inbox for exclusive offers.
                            </div>
                        )}
                    </form>

                    {/* Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
                        <div className="animate-fade-in">
                            <div className="text-3xl mb-2">🎁</div>
                            <div className="font-semibold mb-1">Exclusive Deals</div>
                            <div className="text-sm text-indigo-200">Members-only discounts</div>
                        </div>
                        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="text-3xl mb-2">🔔</div>
                            <div className="font-semibold mb-1">Early Access</div>
                            <div className="text-sm text-indigo-200">Be first to know about new products</div>
                        </div>
                        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="text-3xl mb-2">💝</div>
                            <div className="font-semibold mb-1">Special Gifts</div>
                            <div className="text-sm text-indigo-200">Birthday surprises & rewards</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
