import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, Check, Crown } from "lucide-react";
import { useClientMembership } from "@/hooks/useClientAPI";
import { clientAPI } from "@/services/api";

export const Route = createFileRoute("/client/membership/")({
  head: () => ({
    meta: [{ title: "Membership - Client" }],
  }),
  component: ClientMembership,
});

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const FREE_FEATURES = ["Browse up to 8 creators", "Save creators for later", "Submit project requests"];
const PREMIUM_FEATURES = ["Unlimited creator access", "Unlimited search & comparisons", "Priority booking", "Priority support"];

function ClientMembership() {
  const { data, loading, error, refetch } = useClientMembership();
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const status = data?.client?.status || "free";
  const isPremium = status === "premium";

  const handleUpgrade = async () => {
    try {
      setUpgradeError(null);
      setUpgrading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setUpgradeError("Unable to load the payment provider. Please check your connection and try again.");
        return;
      }

      const orderResponse = await clientAPI.createMembershipOrder();
      const { orderId, amount, currency, keyId } = orderResponse.data;

      if (!keyId) {
        setUpgradeError("Payment provider is not configured. Please contact CC support.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: amount * 100,
        currency,
        order_id: orderId,
        name: "Cloutculturr",
        description: "Premium Membership — 30 days",
        handler: async (response: any) => {
          try {
            await clientAPI.verifyMembershipPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            refetch();
          } catch (err) {
            setUpgradeError(err instanceof Error ? err.message : "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => setUpgrading(false),
        },
        theme: { color: "#7c3aed" },
      });

      razorpay.on("payment.failed", () => {
        setUpgradeError("Payment failed. No charge was made — please try again.");
        setUpgrading(false);
      });

      razorpay.open();
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Failed to start upgrade");
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel your Premium membership? You'll move back to the Free plan immediately.")) return;
    try {
      setCancelling(true);
      await clientAPI.cancelMembership();
      refetch();
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Failed to cancel membership");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Membership</h1>
        <p className="text-muted-foreground mt-1">Your current plan and creator access</p>
      </div>

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading membership...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Unable to load membership</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {upgradeError && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-500">{upgradeError}</div>}

      {data && (
        <>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold flex items-center gap-2 mt-1">
                  {isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
                  {isPremium ? "Premium" : "Free"}
                </p>
              </div>
              {data.client?.startDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Since</p>
                  <p className="text-sm font-medium mt-1">{new Date(data.client.startDate).toLocaleDateString()}</p>
                </div>
              )}
              {data.client?.expiryDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Renews / Expires</p>
                  <p className="text-sm font-medium mt-1">{new Date(data.client.expiryDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`bg-card border rounded-xl p-6 ${!isPremium ? "border-primary" : "border-border"}`}>
              <h3 className="text-lg font-bold">Free</h3>
              <p className="text-3xl font-bold mt-2">₹0</p>
              <ul className="mt-4 space-y-2">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {!isPremium && <p className="mt-4 text-xs text-muted-foreground uppercase tracking-wider">Current plan</p>}
            </div>

            <div className={`bg-card border rounded-xl p-6 ${isPremium ? "border-primary" : "border-border"}`}>
              <h3 className="text-lg font-bold">Premium</h3>
              <p className="text-3xl font-bold mt-2">
                ₹{data.premiumPrice || 100}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="mt-4 space-y-2">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {isPremium ? (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="mt-4 w-full px-4 py-2 border border-border rounded-lg text-sm hover:bg-background disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Premium"}
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="mt-4 w-full px-4 py-2 bg-brand-gradient text-primary-foreground rounded-lg text-sm font-medium hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {upgrading ? "Processing..." : `Upgrade — ₹${data.premiumPrice || 100}`}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
