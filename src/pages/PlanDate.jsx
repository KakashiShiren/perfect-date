import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { invokeLLM } from "@/lib/gemini";
import { DatePlan } from "@/entities/DatePlan";

import DatePlannerForm from "../components/planner/DatePlannerForm";
import DatePlanResults from "../components/planner/DatePlanResults";

export default function PlanDate() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [lastFormData, setLastFormData] = useState(null);
  const [isSupriseMode, setIsSurpriseMode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('surprise') === 'true') {
      setIsSurpriseMode(true);
    }
  }, []);

  const handlePlanGeneration = async (formData) => {
    setIsGenerating(true);
    setError(null);
    setLastFormData(formData);

    try {
      if (!formData.dateTypes || formData.dateTypes.length === 0) {
        setError('Please select at least one date type');
        setIsGenerating(false);
        return;
      }
      if (!formData.timeOfDay) {
        setError('Please select a time of day');
        setIsGenerating(false);
        return;
      }

      const currency = formData.currency || { symbol: '$', code: 'USD', name: 'Dollars', rate: 1 };
      const localBudget = Math.round(formData.budget * currency.rate);
      const dateInfo = formData.plannedDate ? format(formData.plannedDate, 'PPP') : 'Not specified';

      const interestsText = formData.interests && formData.interests.length > 0
        ? formData.interests.map(i => i.replace(/_/g, ' ')).join(', ')
        : 'None specified';

      const milestoneText = formData.milestone
        ? formData.milestone.replace(/_/g, ' ')
        : 'Not specified';

      const emotionalVibeText = formData.emotionalVibe
        ? formData.emotionalVibe.replace(/_/g, ' ')
        : 'flexible vibe';

      const comfortLevelText = formData.comfortLevel
        ? formData.comfortLevel
        : 'any comfort level';

      const prompt = `You are an expert romantic date planner. Create a UNIQUE, CREATIVE, and PERSONALIZED date plan.

**USER PREFERENCES:**
- Budget: ${currency.symbol}${localBudget} (${currency.code})
- Date Types: ${formData.dateTypes.join(', ')}
- Specific Interests: ${interestsText}
- Occasion/Milestone: ${milestoneText}
- Emotional Vibe: ${emotionalVibeText}
- Comfort Level: ${comfortLevelText}
- Location: ${formData.location || 'Any city'}
- Planned Date: ${dateInfo}
- Time: ${formData.timeOfDay}
${formData.foodPreferences ? `- Food Preferences: ${formData.foodPreferences}` : ''}
- Special Notes: ${formData.specialPreferences || 'None'}
- Today's Date: ${format(new Date(), 'PPP')}

**INSTRUCTIONS:**
1. Create a unique, thoughtful date plan tailored to the preferences above
2. Include real venue names and specific locations if a city is provided
3. All costs must be in ${currency.code} (${currency.symbol}) and within the ${currency.symbol}${localBudget} budget
4. Make it feel personal and special, not generic
5. Include 3-5 time-blocked activities

**REQUIRED JSON OUTPUT:**
{
  "title": "Creative romantic title",
  "optimized_for": "1-2 sentences about emotional tone and comfort level",
  "why_this_works": ["bullet 1", "bullet 2", "bullet 3"],
  "itinerary": [
    {
      "time": "6:00 PM",
      "activity": "Detailed description",
      "location": "Venue name and address",
      "cost": 50,
      "insider_tip": "Helpful tip",
      "food_suggestions": "Food recommendations",
      "booking_url": "",
      "phone_number": "",
      "website": ""
    }
  ],
  "total_cost": 150,
  "playlist_suggestion": "Playlist mood or Spotify link",
  "special_notes": "Romantic tips and recommendations",
  "transportation_notes": "How to get between venues",
  "upcoming_events": "Any relevant local events or N/A",
  "conversation_prompts": ["prompt 1", "prompt 2", "prompt 3"],
  "backup_option": "Alternative activity if plans change",
  "reassurance_note": "Warm encouraging message"
}`;

      console.log('Generating date plan with Gemini...');

      const response = await invokeLLM({ prompt });

      console.log('Gemini Response:', response);

      if (!response || !response.itinerary || response.itinerary.length === 0) {
        throw new Error('Invalid response from AI. Please try again.');
      }

      const planData = {
        title: response.title,
        budget: formData.budget,
        date_types: formData.dateTypes,
        interests: formData.interests || [],
        relationship_milestone: formData.milestone || '',
        emotional_vibe: formData.emotionalVibe || '',
        comfort_level: formData.comfortLevel || '',
        location: formData.location || '',
        time_of_day: formData.timeOfDay,
        special_preferences: formData.specialPreferences || '',
        itinerary: response.itinerary,
        total_cost: response.total_cost,
        playlist_suggestion: response.playlist_suggestion,
        special_notes: response.special_notes + (response.transportation_notes ? `\n\nTransportation: ${response.transportation_notes}` : ''),
        upcoming_events: response.upcoming_events || '',
        planned_date: formData.plannedDate ? formData.plannedDate.toISOString() : null,
        is_surprise: isSupriseMode,
        currency_code: currency.code,
        currency_symbol: currency.symbol,
        optimized_for: response.optimized_for,
        why_this_works: response.why_this_works,
        conversation_prompts: response.conversation_prompts,
        backup_option: response.backup_option,
        reassurance_note: response.reassurance_note
      };

      const savedPlan = await DatePlan.create(planData);
      setGeneratedPlan(savedPlan);

    } catch (error) {
      console.error('Error generating date plan:', error);
      setError(error.message || 'Failed to generate date plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMode = async () => {
    const popularCities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'San Francisco, CA', 'Boston, MA', 'Seattle, WA', 'Austin, TX', 'Portland, OR', 'Denver, CO'];
    const location = popularCities[Math.floor(Math.random() * popularCities.length)];

    const surpriseData = {
      budget: Math.floor(Math.random() * 150) + 50,
      dateTypes: ['surprise_me'],
      location,
      timeOfDay: ['afternoon', 'evening'][Math.floor(Math.random() * 2)],
      specialPreferences: 'Surprise me with something romantic and memorable'
    };

    await handlePlanGeneration(surpriseData);
  };

  const handleRegenerate = () => {
    if (lastFormData) {
      setGeneratedPlan(null);
      handlePlanGeneration(lastFormData);
    }
  };

  if (generatedPlan) {
    return <DatePlanResults
      plan={generatedPlan}
      onPlanAnother={() => {
        setGeneratedPlan(null);
        setIsSurpriseMode(false);
      }}
      onRegenerate={lastFormData ? handleRegenerate : null}
    />;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
              Plan Your{" "}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Date
              </span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto opacity-80 dark:text-gray-300">
              Share what feels right for you, and we'll create a thoughtful plan that fits your pace
            </p>
          </motion.div>
        </div>

        {isSupriseMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-pink-500 to-purple-500 border-none text-white">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl text-white">
                  <Sparkles className="w-8 h-8" />
                  Surprise Mode Activated!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg mb-6 text-white">
                  Ready for a spontaneous adventure? Let us surprise you with a magical date experience!
                </p>
                <Button
                  onClick={handleSurpriseMode}
                  disabled={isGenerating}
                  className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-3 text-lg font-semibold rounded-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Your Surprise...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Generate Surprise Date
                    </>
                  )}
                </Button>
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setIsSurpriseMode(false)}
                    className="text-white hover:bg-white/20"
                  >
                    Or customize your preferences instead
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {!isSupriseMode && (
          <DatePlannerForm
            onSubmit={handlePlanGeneration}
            isGenerating={isGenerating}
            onSurpriseMode={() => setIsSurpriseMode(true)}
          />
        )}
      </div>
    </div>
  );
}