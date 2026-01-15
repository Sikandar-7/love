import React from 'react'

const features = [
    {
        icon: '🚚',
        title: 'Free Shipping',
        description: 'Free delivery on orders over PKR 5,000',
        gradient: 'from-blue-400 to-cyan-500'
    },
    {
        icon: '🔒',
        title: 'Secure Payment',
        description: '100% secure payment processing',
        gradient: 'from-green-400 to-emerald-500'
    },
    {
        icon: '↩️',
        title: 'Easy Returns',
        description: '7-day hassle-free return policy',
        gradient: 'from-purple-400 to-pink-500'
    },
    {
        icon: '⭐',
        title: 'Quality Guaranteed',
        description: 'Premium quality products only',
        gradient: 'from-yellow-400 to-orange-500'
    },
    {
        icon: '💬',
        title: '24/7 Support',
        description: 'Always here to help you',
        gradient: 'from-indigo-400 to-purple-500'
    },
    {
        icon: '🎁',
        title: 'Special Offers',
        description: 'Exclusive deals for members',
        gradient: 'from-pink-400 to-rose-500'
    }
]

export default function FeaturesSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="content-container">
                {/* Section Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Why Shop With <span className="gradient-text">Us?</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We provide the best shopping experience with premium quality products and excellent customer service
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="card p-8 card-hover animate-fade-in hover-glow group"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Icon */}
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
