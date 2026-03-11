import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { DatePlan } from "@/entities/DatePlan";
import { motion, AnimatePresence } from "framer-motion";

export default function CollaborativeNotes({ plan, onUpdate }) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    try {
      const notes = plan.collaborative_notes || [];
      notes.push({
        user_name: 'You',
        note: note.trim(),
        timestamp: new Date().toISOString()
      });
      await DatePlan.update(plan.id, { collaborative_notes: notes });
      setNote("");
      onUpdate?.();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const notes = plan.collaborative_notes || [];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-pink-500" />
          Shared Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          <AnimatePresence>
            {notes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No notes yet. Add thoughts about your date!</p>
            ) : (
              notes.map((n, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-pink-50 border border-pink-200">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{n.user_name}</span>
                    <span className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-800">{n.note}</p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note, suggestion, or comment..." className="resize-none" rows={2} />
          <Button onClick={handleAddNote} disabled={isSubmitting || !note.trim()} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}