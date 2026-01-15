import React from 'react'
import Link from 'next/link'

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="content-container relative z-10 py-20 md:py-32">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="animate-fade-in">
                        <div className="inline-block mb-4">
                            <span className="glass px-4 py-2 rounded-full text-sm font-medium">
                                🎉 New Collection 2026
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Discover Your
                            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                                Perfect Style
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 text-indigo-100 leading-relaxed">
                            Shop the latest trends in electronics, fashion, and lifestyle products. Quality guaranteed, delivered to your doorstep.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link href="/store">
                                <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 hover-scale">
                                    Shop Now
                                    <span className="ml-2">→</span>
                                </button>
                            </Link>

                            <button className="px-8 py-4 glass border-2 border-white rounded-lg font-bold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-200">
                                View Collections
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
                            <div className="animate-fade-in">
                                <div className="text-3xl md:text-4xl font-bold mb-1">1000+</div>
                                <div className="text-indigo-200 text-sm">Products</div>
                            </div>
                            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <div className="text-3xl md:text-4xl font-bold mb-1">50K+</div>
                                <div className="text-indigo-200 text-sm">Happy Customers</div>
                            </div>
                            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                <div className="text-3xl md:text-4xl font-bold mb-1">4.9★</div>
                                <div className="text-indigo-200 text-sm">Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Image */}
                    <div className="relative animate-scale-in">
                        <div className="relative z-10">
                            <img
                                src="/hero-banner.png"
                                alt="Shopping"
                                className="w-full h-auto rounded-2xl shadow-2xl"
                            />
                        </div>

                        {/* Floating Cards */}
                        <div className="absolute -top-6 -left-6 glass-dark p-4 rounded-xl shadow-xl animate-pulse-glow hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-2xl">
                                    ✓
                                </div>
                                <div>
                                    <div className="font-bold">Free Shipping</div>
                                    <div className="text-sm text-gray-300">On orders over PKR 5000</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-6 -right-6 glass-dark p-4 rounded-xl shadow-xl animate-pulse-glow hidden md:block" style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                                    🎁
                                </div>
                                <div>
                                    <div className="font-bold">Special Offers</div>
                                    <div className="text-sm text-gray-300">Up to 50% off</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                </svg>
            </div>
        </section>
    )
}
