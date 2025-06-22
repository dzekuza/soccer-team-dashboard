import { supabaseService } from "@/lib/supabase-service";
import SubscriptionsClient from "./subscriptions-client";

export const revalidate = 0; // Revalidate data on every request

export default async function SubscriptionsPage() {
  const subscriptions = await supabaseService.getSubscriptions();

  return <SubscriptionsClient initialSubscriptions={subscriptions} />;
} 