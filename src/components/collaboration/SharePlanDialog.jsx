import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Check } from "lucide-react";
import { DatePlan } from "@/entities/DatePlan";

export default function SharePlanDialog({ plan, onShare }) {
  const [email, setEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) return;
    setIsSharing(true);
    try {
      const sharedWith = plan.shared_with || [];
      if (!sharedWith.includes(email)) {
        sharedWith.push(email);
        await DatePlan.update(plan.id, { shared_with: sharedWith });
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setEmail("");
          onShare?.();
        }, 1500);
      }
    } catch (error) {
      console.error('Error sharing plan:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Share with Partner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Date Plan</DialogTitle>
          <DialogDescription>Invite your partner to collaborate on this date plan together</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Partner's Email</Label>
            <Input id="email" type="email" placeholder="partner@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleShare()} />
          </div>
          {plan.shared_with && plan.shared_with.length > 0 && (
            <div className="space-y-2">
              <Label>Currently shared with:</Label>
              <div className="space-y-1">
                {plan.shared_with.map((e, idx) => (
                  <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-500" />{e}
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button onClick={handleShare} disabled={isSharing || !email.trim() || success} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
            {isSharing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sharing...</> : success ? <><Check className="w-4 h-4 mr-2" />Shared!</> : 'Share Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}