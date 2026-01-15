import React from 'react'
import Link from 'next/link'

const categories = [
    {
        name: 'Electronics',
        handle: 'electronics',
        description: 'Latest gadgets & tech',
        icon: '📱',
        gradient: 'from-blue-500 to-cyan-500',
        image: '/product-headphones.png'
    },
    {
        name: 'Fashion',
        handle: 'fashion',
        description: 'Trendy clothing & accessories',
        icon: '👔',
        gradient: 'from-pink-500 to-rose-500',
        image: null
    },
    {
        name: 'Home & Living',
        handle: 'home-living',
        description: 'Decor & essentials',
        icon: '🏠',
        gradient: 'from-green-500 to-emerald-500',
        image: null
    },
    {
        name: 'Sports',
        handle: 'sports-outdoors',
        description: 'Fitness & outdoor gear',
        icon: '⚽',
        gradient: 'from-orange-500 to-red-500',
        image: null
    },
    {
        name: 'Beauty',
        handle: 'beauty-health',
        description: 'Beauty & wellness',
        icon: '💄',
        gradient: 'from-purple-500 to-pink-500',
        image: null
    },
    {
        name: 'Watches',
        handle: 'watches',
        description: 'Premium timepieces',
        icon: '⌚',
        gradient: 'from-indigo-500 to-purple-500',
        image: '/product-smartwatch.png'
    }
]

export default function CategoriesSection() {
    return (
        <section className="py-20 bg-white">
            <div className="content-container">
                {/* Section Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Shop by <span className="gradient-text">Category</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Explore our wide range of products across different categories
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            href={`/categories/${category.handle}`}
                            className="group"
                        >
                            <div className={`relative overflow-hidden rounded-2xl h-64 card-hover animate-fade-in`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />

                                {/* Pattern Overlay */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                    }} />
                                </div>

                                {/* Image if available */}
                                {category.image && (
                                    <div className="absolute right-0 bottom-0 w-2/3 h-2/3 opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                                    <div>
                                        <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                            {category.icon}
                                        </div>
                                        <h3 className="text-3xl font-bold mb-2">
                                            {category.name}
                                        </h3>
                                        <p className="text-white/90">
                                            {category.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                        Explore
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Shine Effect on Hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12 animate-fade-in">
                    <Link href="/store">
                        <button className="btn-secondary px-8 py-4 text-lg">
                            View All Products
                            <span className="ml-2">→</span>
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
