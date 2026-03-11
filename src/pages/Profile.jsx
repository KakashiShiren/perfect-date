import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DatePlan } from "@/entities/DatePlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Sparkles, MapPin, ThumbsDown, Save, User, Clock, Calendar, Trash2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const INTERESTS = [
  { id: 'live_music', label: 'Live Music', icon: '🎵' },
  { id: 'art_galleries', label: 'Art Galleries', icon: '🖼️' },
  { id: 'hiking', label: 'Hiking', icon: '🥾' },
  { id: 'cooking_classes', label: 'Cooking Classes', icon: '👨‍🍳' },
  { id: 'wine_tasting', label: 'Wine Tasting', icon: '🍷' },
  { id: 'theater', label: 'Theater', icon: '🎭' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'photography', label: 'Photography', icon: '📷' },
  { id: 'dancing', label: 'Dancing', icon: '💃' },
  { id: 'bookstores', label: 'Bookstores', icon: '📚' },
  { id: 'vintage_shopping', label: 'Vintage Shopping', icon: '🛍️' },
  { id: 'beach', label: 'Beach Activities', icon: '🏖️' }
];

const EMOTIONAL_VIBES = [
  { id: 'calm_low_pressure', label: 'Calm & low-pressure', icon: '🌿' },
  { id: 'playful_light', label: 'Playful & light', icon: '✨' },
  { id: 'romantic_relaxed', label: 'Romantic but relaxed', icon: '💫' },
  { id: 'cozy_quiet', label: 'Cozy & quiet', icon: '🕯️' },
  { id: 'deep_conversation', label: 'Deep conversation', icon: '💬' }
];

const COMFORT_LEVELS = [
  { id: 'introverted', label: 'Introverted', icon: '🌙' },
  { id: 'neutral', label: 'Neutral', icon: '☁️' },
  { id: 'extroverted', label: 'Extroverted', icon: '☀️' }
];

const CURRENCIES = ['USD', 'INR', 'GBP', 'EUR', 'JPY', 'CAD', 'AUD'];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  const [prefs, setPrefs] = useState({
    preferred_date_types: [],
    preferred_interests: [],
    preferred_emotional_vibe: '',
    preferred_comfort_level: '',
    preferred_location: '',
    preferred_currency: 'USD'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        // Load saved prefs from localStorage
        const savedPrefs = localStorage.getItem(`prefs_${authUser.id}`);
        if (savedPrefs) setPrefs(JSON.parse(savedPrefs));
      }
      const allPlans = await DatePlan.filter({}, '-created_at', 50);
      setPlans(allPlans);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayPref = (field, id) => {
    setPrefs(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(x => x !== id) : [...prev[field], id]
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    if (user) {
      localStorage.setItem(`prefs_${user.id}`, JSON.stringify(prefs));
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setReaction = async (plan, reaction) => {
    const newReaction = plan.reaction === reaction ? null : reaction;
    await DatePlan.update(plan.id, { reaction: newReaction });
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, reaction: newReaction } : p));
  };

  const deletePlan = async (planId) => {
    await DatePlan.delete(planId);
    setPlans(prev => prev.filter(p => p.id !== planId));
  };

  const filteredPlans = plans.filter(p => {
    if (historyFilter === 'favorites') return p.reaction === 'favorite';
    if (historyFilter === 'dislikes') return p.reaction === 'dislike';
    return true;
  });

  const stats = {
    total: plans.length,
    favorites: plans.filter(p => p.reaction === 'favorite').length,
    dislikes: plans.filter(p => p.reaction === 'dislike').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.user_metadata?.full_name || 'Your Profile'}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Plans', value: stats.total, icon: '📅' },
            { label: 'Favorites', value: stats.favorites, icon: '❤️' },
            { label: 'Disliked', value: stats.dislikes, icon: '👎' }
          ].map((stat) => (
            <Card key={stat.label} className="text-center shadow-md border-pink-100 bg-white/80 dark:bg-gray-800/80">
              <CardContent className="pt-5 pb-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preferences */}
        <Card className="shadow-xl border-none bg-white/95 dark:bg-gray-800/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl dark:text-white">
              <Sparkles className="w-5 h-5 text-pink-500" />
              Your Preferences
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">Saved preferences will pre-fill the date planning form</p>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Date Types */}
            <div>
              <Label className="text-base font-semibold mb-3 block dark:text-gray-200">Favorite Date Types</Label>
              <div className="flex flex-wrap gap-2">
                {DATE_TYPES.map(dt => (
                  <button
                    key={dt.id}
                    onClick={() => toggleArrayPref('preferred_date_types', dt.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      prefs.preferred_date_types.includes(dt.id)
                        ? 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                        : 'border-gray-200 text-gray-600 hover:border-pink-300 dark:border-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {dt.icon} {dt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <Label className="text-base font-semibold mb-3 block dark:text-gray-200">Interests</Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(i => (
                  <button
                    key={i.id}
                    onClick={() => toggleArrayPref('preferred_interests', i.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      prefs.preferred_interests.includes(i.id)
                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'border-gray-200 text-gray-600 hover:border-purple-300 dark:border-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {i.icon} {i.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe & Comfort */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-semibold mb-3 block dark:text-gray-200">Preferred Vibe</Label>
                <div className="space-y-2">
                  {EMOTIONAL_VIBES.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setPrefs(prev => ({ ...prev, preferred_emotional_vibe: prev.preferred_emotional_vibe === v.id ? '' : v.id }))}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all text-left ${
                        prefs.preferred_emotional_vibe === v.id
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                          : 'border-gray-200 hover:border-pink-300 dark:border-gray-600'
                      }`}
                    >
                      <span>{v.icon}</span>
                      <span className="dark:text-gray-200">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block dark:text-gray-200">Comfort Level</Label>
                <div className="space-y-2">
                  {COMFORT_LEVELS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setPrefs(prev => ({ ...prev, preferred_comfort_level: prev.preferred_comfort_level === c.id ? '' : c.id }))}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all text-left ${
                        prefs.preferred_comfort_level === c.id
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                          : 'border-gray-200 hover:border-pink-300 dark:border-gray-600'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span className="dark:text-gray-200">{c.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-1 block dark:text-gray-300">Default Location</Label>
                    <Input
                      placeholder="Your city (e.g. New York, NY)"
                      value={prefs.preferred_location}
                      onChange={e => setPrefs(prev => ({ ...prev, preferred_location: e.target.value }))}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 block dark:text-gray-300">Currency</Label>
                    <Select value={prefs.preferred_currency} onValueChange={val => setPrefs(prev => ({ ...prev, preferred_currency: val }))}>
                      <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={savePreferences}
              disabled={saving}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-full text-base font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Plan History */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-pink-500" />
              Date Plan History
            </h2>
            <div className="flex gap-2">
              {['all', 'favorites', 'dislikes'].map(f => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                    historyFilter === f ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-100 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'favorites' ? '❤️ Favorites' : '👎 Disliked'}
                </button>
              ))}
            </div>
          </div>

          {filteredPlans.length === 0 ? (
            <Card className="bg-white/80 dark:bg-gray-800/80 border-pink-100">
              <CardContent className="py-10 text-center">
                <p className="text-gray-500 dark:text-gray-400">No plans found for this filter.</p>
                <Link to={createPageUrl("PlanDate")} className="mt-3 inline-block">
                  <Button className="mt-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full">
                    <Sparkles className="w-4 h-4 mr-2" />Plan Your First Date
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-white/90 dark:bg-gray-800/80 border-pink-100 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{plan.title}</h3>
                            {plan.reaction === 'favorite' && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">❤️ Favorite</span>}
                            {plan.reaction === 'dislike' && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">👎 Disliked</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                            {plan.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{plan.location}</span>}
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{plan.time_of_day}</span>
                            <span>{plan.currency_symbol || '$'}{plan.total_cost}</span>
                            <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                          </div>
                          {plan.date_types && plan.date_types.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {plan.date_types.map(dt => (
                                <span key={dt} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">{dt.replace(/_/g, ' ')}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setReaction(plan, 'favorite')}
                            title="Favorite"
                            className={`p-2 rounded-full transition-colors ${plan.reaction === 'favorite' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'}`}
                          >
                            <Heart className="w-4 h-4" fill={plan.reaction === 'favorite' ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => setReaction(plan, 'dislike')}
                            title="Dislike"
                            className={`p-2 rounded-full transition-colors ${plan.reaction === 'dislike' ? 'bg-gray-100 text-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(createPageUrl("ViewPlan") + `?id=${plan.id}`)}
                            title="View"
                            className="p-2 rounded-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePlan(plan.id)}
                            title="Delete"
                            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}