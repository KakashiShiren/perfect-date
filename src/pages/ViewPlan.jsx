import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DatePlan } from "@/entities/DatePlan";
import DatePlanResults from "../components/planner/DatePlanResults";
import { createPageUrl } from "@/utils";

export default function ViewPlan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const planId = urlParams.get('id');
      
      if (!planId) {
        navigate(createPageUrl("SavedPlans"));
        return;
      }

      const loadedPlan = await DatePlan.get(planId);
      setPlan(loadedPlan);
    } catch (error) {
      console.error('Error loading plan:', error);
      navigate(createPageUrl("SavedPlans"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your date plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <DatePlanResults 
      plan={plan} 
      onPlanAnother={() => navigate(createPageUrl("PlanDate"))} 
    />
  );
}