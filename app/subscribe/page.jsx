"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function SubscribePage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <DashboardNav />
      <SubscribeFlow />
    </ProtectedRoute>
  );
}

function SubscribeFlow() {
  const [plans, setPlans] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await api.getPlans();
        if (isMounted) setPlans(res.data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectPlan = async (planId) => {
    setError("");
    setSelectedPlan(planId);
    try {
      const res = await api.createPaymentIntent(planId);
      setClientSecret(res.data.clientSecret);
    } catch (err) {
      setError(err.message);
    }
  };

  if (clientSecret) {
    return (
      <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm planLabel={plans[selectedPlan].label} />
        </Elements>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1">Choose your plan</h1>
      <p className="text-muted-foreground mb-6">
        One-time payment, no auto-renewal. Renew manually whenever you like.
      </p>

      {loading && <p className="text-sm text-muted-foreground">Loading plans...</p>}
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {plans && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(plans).map(([planId, plan]) => (
            <Card key={planId} className={planId === "12_month" ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.label}
                  {planId === "12_month" && <Badge>Best value</Badge>}
                </CardTitle>
                <CardDescription>{plan.displayPrice}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{plan.displayPrice}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleSelectPlan(planId)}>
                  Choose plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

function CheckoutForm({ planLabel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError("");

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm payment</CardTitle>
        <CardDescription>{planLabel} plan</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <PaymentElement />
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!stripe || submitting}>
            {submitting ? "Processing..." : "Pay now"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}