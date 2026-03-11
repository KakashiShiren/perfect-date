import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { invokeLLM } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Star, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_COLORS = {
  "Romantic Dinner": "bg-rose-100 text-rose-700",
  "Outdoor Adventure": "bg-green-100 text-green-700",
  "Artsy & Creative": "bg-purple-100 text-purple-700",
  "Cozy & Chill": "bg-amber-100 text-amber-700",
  "Fun & Playful": "bg-blue-100 text-blue-700",
  "Hidden Gem": "bg-pink-100 text-pink-700",
};

export default function TrendingDates() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("New York");

  useEffect(() => {
    loadTrendingSpots();
  }, []);

  const loadTrendingSpots = async () => {
    setLoading(true);
    try {
      const userCity = "New York, NY";
      setCity(userCity.split(",")[0]);

      const result = await invokeLLM({
        prompt: `Generate a list of 6 trending, highly-rated date spots and experiences in ${userCity} that couples are loving right now. Mix different vibes: romantic dinners, hidden gems, outdoor spots, artsy places, fun activities.

For each spot include:
- name: the venue/experience name
- category: one of "Romantic Dinner", "Outdoor Adventure", "Artsy & Creative", "Cozy & Chill", "Fun & Playful", "Hidden Gem"
- description: 1 short sentence (max 12 words) describing what makes it special
- neighborhood: the neighborhood or area within the city
- avg_cost: estimated cost per person as a number
- rating: a float between 4.2 and 5.0
- why_trending: one short phrase like "Rooftop views at sunset" or "Secret cocktail garden"

Use REAL venue names that actually exist in ${userCity}. Make them feel discovered and exciting.

Return a JSON object with a "spots" array.`
      });

      setSpots(result.spots || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanWithSpot = (spot) => {
    const params = new URLSearchParams({ location: city, spot: spot.name, category: spot.category });
    navigate(createPageUrl("PlanDate") + "?" + params.toString());
  };

  return (
    <section className="py-20 bg-white/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-pink-500" />
              <span className="text-sm font-semibold text-pink-500 uppercase tracking-wider">Trending Now</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Hot Date Spots in{" "}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{city}</span>
            </h2>
            <p className="text-gray-500 mt-1">Popular picks loved by couples this week</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadTrendingSpots} disabled={loading} className="border-pink-200 text-pink-600 hover:bg-pink-50 shrink-0">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/60 rounded-2xl p-6 animate-pulse h-52">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spots.map((spot, index) => (
              <motion.div key={spot.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }}>
                <Card className="group bg-white/80 backdrop-blur-sm border-pink-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`text-xs font-medium px-2 py-0.5 ${CATEGORY_COLORS[spot.category] || "bg-gray-100 text-gray-700"}`}>
                        {spot.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                        {spot.rating?.toFixed(1)}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">{spot.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <MapPin className="w-3 h-3" />{spot.neighborhood}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 flex-1">{spot.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 border border-pink-200 rounded-full px-3 py-1 font-medium">
                        ✨ {spot.why_trending}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">~${spot.avg_cost}/person</span>
                      <Button size="sm" onClick={() => handlePlanWithSpot(spot)} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full text-xs px-4">
                        <Sparkles className="w-3 h-3 mr-1" />Plan Here
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}