export async function logEmailDelivery(supabaseClient) {
  if (!supabaseClient) {
    throw new Error("Supabase client is required for email tracking.");
  }

  const { error } = await supabaseClient.from("email_delivery_logs").insert({});
  if (error) throw error;
}
