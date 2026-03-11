import React, { useState, useEffect } from "react";
import { DatePlan } from "@/entities/DatePlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Trash2, Edit, Heart, MapPin, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO, isSameDay } from "date-fns";
import { motion } from "framer-motion";

export default function CalendarPage() {
  const [savedPlans, setSavedPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newDate, setNewDate] = useState(null);

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const loadSavedPlans = async () => {
    try {
      const plans = await DatePlan.filter({}, '-created_at');
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this date plan?')) return;
    try {
      await DatePlan.delete(planId);
      setSavedPlans(savedPlans.filter(plan => plan.id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const updatePlanDate = async (planId) => {
    if (!newDate) return;
    try {
      await DatePlan.update(planId, { planned_date: newDate.toISOString() });
      setSavedPlans(savedPlans.map(plan =>
        plan.id === planId ? { ...plan, planned_date: newDate.toISOString() } : plan
      ));
      setNewDate(null);
    } catch (error) {
      console.error('Error updating plan date:', error);
    }
  };

  const datesWithPlans = savedPlans
    .filter(plan => plan.planned_date)
    .map(plan => { try { return parseISO(plan.planned_date); } catch { return null; } })
    .filter(Boolean);

  const filteredPlans = selectedDate
    ? savedPlans.filter(plan => {
        if (!plan.planned_date) return false;
        try { return isSameDay(parseISO(plan.planned_date), selectedDate); } catch { return false; }
      })
    : savedPlans;

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Date{" "}
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Calendar</span>
          </h1>
          <p className="text-xl text-gray-600">View, schedule, and manage your date plans</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-pink-500" />Select a Date
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border"
                  modifiers={{ hasPlans: datesWithPlans }}
                  modifiersStyles={{ hasPlans: { backgroundColor: '#fce7f3', fontWeight: 'bold', color: '#ec4899' } }}
                />
              </CardContent>
              {selectedDate && (
                <CardContent className="pt-0">
                  <Button variant="outline" onClick={() => setSelectedDate(null)} className="w-full">Show All Plans</Button>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedDate && (
              <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-gray-700">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Showing plans for <strong>{format(selectedDate, 'MMMM d, yyyy')}</strong>
                </p>
              </div>
            )}

            {filteredPlans.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {selectedDate ? 'No plans for this date' : 'No date plans yet'}
                </h3>
                <p className="text-gray-600">
                  {selectedDate ? 'Try selecting a different date or create a new plan' : 'Start planning your perfect dates to see them here'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPlans.map((plan, index) => (
                  <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                    <Card className="hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">{plan.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              {plan.planned_date && (
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4 text-pink-500" />
                                  <span className="font-medium">{format(parseISO(plan.planned_date), 'MMM d, yyyy')}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{plan.time_of_day}</div>
                              {plan.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{plan.location}</div>}
                              <span className="font-medium">{plan.currency_symbol || '$'}{plan.total_cost}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setNewDate(plan.planned_date ? parseISO(plan.planned_date) : new Date())} className="text-pink-600 hover:text-pink-700">
                                  <Edit className="w-4 h-4 mr-1" />Edit Date
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Edit Date for "{plan.title}"</DialogTitle></DialogHeader>
                                <div className="flex flex-col items-center gap-4 py-4">
                                  <Calendar mode="single" selected={newDate} onSelect={setNewDate} disabled={(date) => date < new Date()} className="rounded-md border" />
                                  <div className="flex gap-2 w-full">
                                    <Button onClick={() => updatePlanDate(plan.id)} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500">Save Date</Button>
                                    <Button variant="outline" onClick={() => setNewDate(null)} className="flex-1">Cancel</Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" onClick={() => deletePlan(plan.id)} className="text-gray-600 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Created {format(parseISO(plan.created_at), 'MMM d, yyyy')}</p>
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
    </div>
  );
}