import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Calendar, Share2, Star } from "lucide-react";
import { motion } from "framer-motion";
import TrendingDates from "@/components/home/TrendingDates";

export default function Home() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Planning",
      description: "Get personalized date ideas tailored to your preferences, budget, and location"
    },
    {
      icon: Calendar,
      title: "Detailed Itineraries",
      description: "Complete time-blocked plans with activities, locations, and cost estimates"
    },
    {
      icon: Heart,
      title: "Surprise Mode",
      description: "Let us surprise you with spontaneous and thoughtful date ideas"
    },
    {
      icon: Share2,
      title: "Save & Share",
      description: "Save your favorite plans and share them with your partner"
    }
  ];

  const testimonials = [
    {
      name: "Sarah & Mike",
      text: "PerfectDate helped us discover amazing local spots we never knew existed!",
      rating: 5
    },
    {
      name: "Jessica & David",
      text: "The surprise mode gave us our most memorable date ever. Highly recommend!",
      rating: 5
    },
    {
      name: "Emma & Chris",
      text: "Perfect for busy couples who want thoughtful dates without the planning stress.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Hero Background Images */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-3 gap-4 h-full">
            <div className="bg-cover bg-center" style={{backgroundImage: "url(https://source.unsplash.com/800x1200/?romantic,couple,date)"}} />
            <div className="bg-cover bg-center" style={{backgroundImage: "url(https://source.unsplash.com/800x1200/?restaurant,dinner,romantic)"}} />
            <div className="bg-cover bg-center" style={{backgroundImage: "url(https://source.unsplash.com/800x1200/?sunset,couple,love)"}} />
          </div>
        </div>

        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            >
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="inline-block mb-6"
            >
              <Heart className="w-16 h-16 text-pink-500 fill-pink-500 mx-auto" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 tracking-tight">
                Create{" "}
                <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Perfect
                </span>
                <br />
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Date Experiences
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Your AI-powered date planner that creates personalized, memorable experiences 
                tailored to your preferences, budget, and location.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to={createPageUrl("PlanDate")}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Sparkles className="w-6 h-6 mr-2" />
                    Plan Your Perfect Date
                  </Button>
                </Link>
                
                <Link to={createPageUrl("PlanDate") + "?surprise=true"}>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-pink-500 text-pink-600 hover:bg-pink-50 px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300"
                  >
                    <Heart className="w-6 h-6 mr-2" />
                    Surprise Me!
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PerfectDate?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make date planning effortless, creative, and perfectly tailored to you
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Dates Section */}
      <TrendingDates />

      {/* Testimonials Section */}
      <section className="py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Couples Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what others are saying about their perfect dates
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">
                    {testimonial.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Perfect Date?
          </h2>
          <p className="text-xl text-pink-100 mb-8 leading-relaxed">
            Join thousands of couples who've discovered amazing date experiences with PerfectDate
          </p>
          <Link to={createPageUrl("PlanDate")}>
            <Button 
              size="lg" 
              className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Start Planning Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}