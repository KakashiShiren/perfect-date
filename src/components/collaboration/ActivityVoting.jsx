import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { DatePlan } from "@/entities/DatePlan";
import { motion } from "framer-motion";

export default function ActivityVoting({ plan, activityIndex, onUpdate }) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (vote) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      const itinerary = [...plan.itinerary];
      const activity = itinerary[activityIndex];
      if (!activity.votes) activity.votes = {};

      const userKey = 'local_user';
      if (activity.votes[userKey] === vote) {
        delete activity.votes[userKey];
      } else {
        activity.votes[userKey] = vote;
      }

      await DatePlan.update(plan.id, { itinerary });
      onUpdate?.();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const activity = plan.itinerary[activityIndex];
  const votes = activity?.votes || {};
  const userVote = votes['local_user'];
  const upvotes = Object.values(votes).filter(v => v === 'up').length;
  const downvotes = Object.values(votes).filter(v => v === 'down').length;

  return (
    <div className="flex items-center gap-2">
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button variant={userVote === 'up' ? 'default' : 'outline'} size="sm" onClick={() => handleVote('up')} disabled={isVoting} className={userVote === 'up' ? 'bg-green-500 hover:bg-green-600' : ''}>
          <ThumbsUp className="w-3 h-3 mr-1" />
          {upvotes > 0 && <span className="text-xs">{upvotes}</span>}
        </Button>
      </motion.div>
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button variant={userVote === 'down' ? 'default' : 'outline'} size="sm" onClick={() => handleVote('down')} disabled={isVoting} className={userVote === 'down' ? 'bg-red-500 hover:bg-red-600' : ''}>
          <ThumbsDown className="w-3 h-3 mr-1" />
          {downvotes > 0 && <span className="text-xs">{downvotes}</span>}
        </Button>
      </motion.div>
    </div>
  );
}