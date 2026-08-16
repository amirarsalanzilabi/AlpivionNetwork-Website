import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify authorization using CRON_SECRET
  const authHeader = req.headers.get("Authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.error("Unauthorized access attempt to cleanup function");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all users
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to list users" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    // Find unverified users created more than 15 minutes ago
    const unverifiedUsers = usersData.users.filter((user) => {
      const createdAt = new Date(user.created_at);
      const isUnverified = !user.email_confirmed_at; // falsy = not verified
      const isOldEnough = createdAt < fifteenMinutesAgo;
      return isUnverified && isOldEnough;
    });

    console.log(`Found ${unverifiedUsers.length} unverified users older than 15 minutes`);

    let deletedCount = 0;
    const errors: string[] = [];

    // Delete each unverified user
    for (const user of unverifiedUsers) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error(`Failed to delete user ${user.id}:`, deleteError);
        errors.push(`${user.id}: ${deleteError.message}`);
      } else {
        console.log(`Deleted unverified user: ${user.email} (created: ${user.created_at})`);
        deletedCount++;
      }
    }

    const result = {
      message: `Cleanup complete`,
      found: unverifiedUsers.length,
      deleted: deletedCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    };

    console.log("Cleanup result:", result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
