import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Heart, MapPin, Clock, DollarSign, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const DATE_TYPES = [
  { id: 'at_home', label: 'At Home', icon: '🏠' },
  { id: 'cafe', label: 'Café', icon: '☕' },
  { id: 'fancy_dinner', label: 'Fancy Dinner', icon: '🍽️' },
  { id: 'outdoor_adventure', label: 'Outdoor Adventure', icon: '🏞️' },
  { id: 'artsy', label: 'Artsy', icon: '🎨' },
  { id: 'arcade_gaming', label: 'Arcade/Gaming', icon: '🎮' },
  { id: 'chill_walk', label: 'Chill Walk', icon: '🚶' },
  { id: 'surprise_me', label: 'Surprise Me', icon: '🎲' }
];

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'evening', label: 'Evening', icon: '🌆' },
  { value: 'late_night', label: 'Late Night', icon: '🌙' }
];

const CURRENCIES = [
  { symbol: '$', code: 'USD', name: 'US Dollar', rate: 1 },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee', rate: 83 },
  { symbol: '£', code: 'GBP', name: 'British Pound', rate: 0.79 },
  { symbol: '€', code: 'EUR', name: 'Euro', rate: 0.92 },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen', rate: 149 },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar', rate: 1.35 },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar', rate: 1.54 }
];

const INTERESTS = [
  { id: 'live_music', label: 'Live Music', icon: '🎵' },
  { id: 'art_galleries', label: 'Art Galleries', icon: '🖼️' },
  { id: 'hiking', label: 'Hiking', icon: '🥾' },
  { id: 'cooking_classes', label: 'Cooking Classes', icon: '👨‍🍳' },
  { id: 'wine_tasting', label: 'Wine Tasting', icon: '🍷' },
  { id: 'theater', label: 'Theater/Shows', icon: '🎭' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'photography', label: 'Photography', icon: '📷' },
  { id: 'dancing', label: 'Dancing', icon: '💃' },
  { id: 'bookstores', label: 'Bookstores', icon: '📚' },
  { id: 'vintage_shopping', label: 'Vintage Shopping', icon: '🛍️' },
  { id: 'beach', label: 'Beach Activities', icon: '🏖️' }
];

const MILESTONES = [
  { id: 'first_date', label: 'First Date', icon: '💕', description: 'Getting to know each other' },
  { id: 'anniversary', label: 'Anniversary', icon: '💝', description: 'Celebrating your journey together' },
  { id: 'casual_hangout', label: 'Casual Hangout', icon: '😊', description: 'Low-key quality time' },
  { id: 'celebration', label: 'Celebration', icon: '🎉', description: 'Special achievement or milestone' },
  { id: 'reconnecting', label: 'Reconnecting', icon: '🔄', description: 'Spending quality time together' },
  { id: 'special_occasion', label: 'Special Occasion', icon: '🎁', description: 'Birthday, promotion, etc.' }
];

const EMOTIONAL_VIBES = [
  { id: 'calm_low_pressure', label: 'Calm & low-pressure', icon: '🌿' },
  { id: 'playful_light', label: 'Playful & light', icon: '✨' },
  { id: 'romantic_relaxed', label: 'Romantic but relaxed', icon: '💫' },
  { id: 'cozy_quiet', label: 'Cozy & quiet', icon: '🕯️' },
  { id: 'deep_conversation', label: 'Deep conversation friendly', icon: '💬' }
];

const COMFORT_LEVELS = [
  { id: 'introverted', label: 'Introverted', icon: '🌙' },
  { id: 'neutral', label: 'Neutral', icon: '☁️' },
  { id: 'extroverted', label: 'Extroverted', icon: '☀️' }
];

export default function DatePlannerForm({ onSubmit, isGenerating, onSurpriseMode }) {
  const [formData, setFormData] = useState({
    budget: 100,
    dateTypes: [],
    interests: [],
    milestone: '',
    emotionalVibe: '',
    comfortLevel: '',
    location: '',
    timeOfDay: '',
    specialPreferences: '',
    foodPreferences: '',
    currency: 'USD',
    plannedDate: null
  });

  useEffect(() => {
    loadUserPrefs();
  }, []);

  const loadUserPrefs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const savedPrefs = localStorage.getItem(`prefs_${user.id}`);
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs);
          setFormData(prev => ({
            ...prev,
            dateTypes: prefs.preferred_date_types?.length ? prefs.preferred_date_types : prev.dateTypes,
            interests: prefs.preferred_interests?.length ? prefs.preferred_interests : prev.interests,
            emotionalVibe: prefs.preferred_emotional_vibe || prev.emotionalVibe,
            comfortLevel: prefs.preferred_comfort_level || prev.comfortLevel,
            location: prefs.preferred_location || prev.location,
            currency: prefs.preferred_currency || prev.currency,
          }));
        }
      }
    } catch (e) {}
  };

  const showFoodPreferences = formData.dateTypes.includes('cafe') || formData.dateTypes.includes('fancy_dinner');
  const currency = CURRENCIES.find(c => c.code === formData.currency) || CURRENCIES[0];

  const handleDateTypeChange = (typeId, checked) => {
    setFormData(prev => ({
      ...prev,
      dateTypes: checked ? [...prev.dateTypes, typeId] : prev.dateTypes.filter(id => id !== typeId)
    }));
  };

  const handleInterestChange = (interestId, checked) => {
    setFormData(prev => ({
      ...prev,
      interests: checked ? [...prev.interests, interestId] : prev.interests.filter(i => i !== interestId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.dateTypes.length === 0 || !formData.timeOfDay) {
      alert('Please select at least one date type and time of day');
      return;
    }
    onSubmit({ ...formData, currency });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <Card className="shadow-xl border-none bg-white/95 backdrop-blur-sm dark:bg-gray-800/90 hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold dark:text-white">Tell us about your perfect date</CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Budget */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-pink-500" />
                <Label className="text-lg font-semibold dark:text-gray-200">Budget</Label>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl font-bold text-pink-600">{currency.symbol}{Math.round(formData.budget * currency.rate)}</span>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>{curr.symbol} {curr.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Slider value={[formData.budget]} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value[0] }))} max={500} min={0} step={10} className="w-full" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{currency.symbol}0</span>
                  <span>{currency.symbol}{Math.round(500 * currency.rate)}</span>
                </div>
              </div>
            </div>

            {/* Emotional Context */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <Label className="text-lg font-semibold dark:text-gray-200">How should this date feel? (Optional)</Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EMOTIONAL_VIBES.map((vibe) => (
                  <div key={vibe.id} onClick={() => setFormData(prev => ({ ...prev, emotionalVibe: prev.emotionalVibe === vibe.id ? '' : vibe.id }))}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-150 ${formData.emotionalVibe === vibe.id ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 dark:border-pink-400' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50 dark:border-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{vibe.icon}</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{vibe.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comfort Level */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold dark:text-gray-200">Your comfort level (Optional)</Label>
              <div className="grid grid-cols-3 gap-3">
                {COMFORT_LEVELS.map((level) => (
                  <div key={level.id} onClick={() => setFormData(prev => ({ ...prev, comfortLevel: prev.comfortLevel === level.id ? '' : level.id }))}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-150 ${formData.comfortLevel === level.id ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50 dark:border-gray-600'}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl">{level.icon}</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{level.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Types */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <Label className="text-lg font-semibold dark:text-gray-200">Type of Date</Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DATE_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2 p-3 rounded-lg border-2 border-transparent hover:border-pink-300 hover:bg-pink-50 transition-all duration-150 cursor-pointer">
                    <Checkbox id={type.id} checked={formData.dateTypes.includes(type.id)} onCheckedChange={(checked) => handleDateTypeChange(type.id, checked)} />
                    <Label htmlFor={type.id} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <span className="text-lg">{type.icon}</span>{type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <Label className="text-lg font-semibold dark:text-gray-200">Specific Interests (Optional)</Label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select activities you both enjoy for more personalized suggestions</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS.map((interest) => (
                  <div key={interest.id} className="flex items-center space-x-2 p-3 rounded-lg border-2 border-transparent hover:border-pink-300 hover:bg-pink-50 transition-all duration-150 cursor-pointer">
                    <Checkbox id={interest.id} checked={formData.interests.includes(interest.id)} onCheckedChange={(checked) => handleInterestChange(interest.id, checked)} />
                    <Label htmlFor={interest.id} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <span className="text-lg">{interest.icon}</span>{interest.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <Label className="text-lg font-semibold dark:text-gray-200">Occasion (Optional)</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MILESTONES.map((milestone) => (
                  <div key={milestone.id} onClick={() => setFormData(prev => ({ ...prev, milestone: prev.milestone === milestone.id ? '' : milestone.id }))}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-150 ${formData.milestone === milestone.id ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50 dark:border-gray-600'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{milestone.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{milestone.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-500" />
                <Label htmlFor="location" className="text-lg font-semibold dark:text-gray-200">Location</Label>
              </div>
              <Input id="location" placeholder="Enter your city or area (optional)" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} className="text-lg" />
            </div>

            {/* Date Picker */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-pink-500" />
                <Label className="text-lg font-semibold dark:text-gray-200">When is the date?</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal text-lg">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.plannedDate ? format(formData.plannedDate, 'PPP') : 'Select a date (optional)'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.plannedDate} onSelect={(date) => setFormData(prev => ({ ...prev, plannedDate: date }))} disabled={(date) => date < new Date()} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time of Day */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-500" />
                <Label className="text-lg font-semibold dark:text-gray-200">Time of Day</Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TIME_OPTIONS.map((time) => (
                  <Button key={time.value} type="button" variant={formData.timeOfDay === time.value ? "default" : "outline"}
                    className={`w-full flex items-center justify-center gap-2 transition-all duration-150 ${formData.timeOfDay === time.value ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105' : 'hover:bg-pink-50 hover:border-pink-300 hover:scale-105'}`}
                    onClick={() => setFormData(prev => ({ ...prev, timeOfDay: time.value }))}>
                    <span className="text-lg">{time.icon}</span>{time.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Food Preferences */}
            {showFoodPreferences && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍽️</span>
                  <Label htmlFor="foodPreferences" className="text-lg font-semibold dark:text-gray-200">Food Preferences</Label>
                </div>
                <Textarea id="foodPreferences" placeholder="Any dietary restrictions or preferences?" value={formData.foodPreferences} onChange={(e) => setFormData(prev => ({ ...prev, foodPreferences: e.target.value }))} className="h-20" />
              </div>
            )}

            {/* Special Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <Label htmlFor="preferences" className="text-lg font-semibold dark:text-gray-200">Special Preferences</Label>
              </div>
              <Textarea id="preferences" placeholder="Any other special requirements?" value={formData.specialPreferences} onChange={(e) => setFormData(prev => ({ ...prev, specialPreferences: e.target.value }))} className="h-20" />
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button type="submit" disabled={isGenerating} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg font-semibold rounded-full shadow-lg">
                {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating Your Perfect Date...</> : <><Heart className="w-5 h-5 mr-2" />Generate My Date Plan</>}
              </Button>
              <Button type="button" variant="outline" onClick={onSurpriseMode} className="border-2 border-pink-500 text-pink-600 hover:bg-pink-50 py-6 text-lg font-semibold rounded-full">
                <Sparkles className="w-5 h-5 mr-2" />Surprise Me!
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}