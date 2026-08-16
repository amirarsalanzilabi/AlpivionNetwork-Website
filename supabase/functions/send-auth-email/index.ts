import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AuthEmailRequest {
  email: string;
  redirectUrl: string;
  type: "recovery" | "signup";
  password?: string; // Required for signup
}

const getEmailContent = (type: "recovery" | "signup", actionUrl: string) => {
  const year = new Date().getFullYear();
  
  if (type === "signup") {
    return {
      subject: "Verify your Alpivion Network account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0e1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e1a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 12px; border: 1px solid #1f2937;">
                  <tr>
                    <td style="padding: 40px 40px 20px;">
                      <h1 style="margin: 0 0 8px; color: #f59e0b; font-size: 28px; font-weight: bold;">✈️ Alpivion Network</h1>
                      <p style="margin: 0; color: #9ca3af; font-size: 14px;">Virtual Aviation Community</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 22px;">Welcome aboard, Pilot!</h2>
                      <p style="margin: 0 0 24px; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                        Thanks for joining the Alpivion Network. Click the button below to verify your email and complete your registration.
                      </p>
                      <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 8px;">
                            <a href="${actionUrl}" style="display: inline-block; padding: 14px 32px; color: #0a0e1a; text-decoration: none; font-weight: 600; font-size: 16px;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px; border-top: 1px solid #1f2937; padding-top: 20px;">
                        © ${year} Alpivion Network. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };
  }
  
  // Recovery email
  return {
    subject: "Reset your Alpivion Network password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0e1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e1a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 12px; border: 1px solid #1f2937;">
                <tr>
                  <td style="padding: 40px 40px 20px;">
                    <h1 style="margin: 0 0 8px; color: #f59e0b; font-size: 28px; font-weight: bold;">✈️ Alpivion Network</h1>
                    <p style="margin: 0; color: #9ca3af; font-size: 14px;">Virtual Aviation Community</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px;">
                    <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 22px;">Password Reset Request</h2>
                    <p style="margin: 0 0 24px; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                      We received a request to reset your password. Click the button below to choose a new password.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 8px;">
                          <a href="${actionUrl}" style="display: inline-block; padding: 14px 32px; color: #0a0e1a; text-decoration: none; font-weight: 600; font-size: 16px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                      If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px 40px;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px; border-top: 1px solid #1f2937; padding-top: 20px;">
                      © ${year} Alpivion Network. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }

    const { email, redirectUrl, type, password }: AuthEmailRequest = await req.json();

    if (!email || !redirectUrl || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, redirectUrl, and type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (type === "signup" && !password) {
      return new Response(
        JSON.stringify({ error: "Password is required for signup" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${type} email request for ${email}`);

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let actionUrl: string;

    if (type === "signup") {
      // For signup, we need to create the user first, then generate a signup link
      // First check if user exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email);
      
      if (existingUser && existingUser.email_confirmed_at) {
        // User already exists and is confirmed - return success:false so frontend can handle
        return new Response(
          JSON.stringify({ success: false, error: "EMAIL_EXISTS" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (existingUser && !existingUser.email_confirmed_at) {
        // User exists but not confirmed - delete and recreate
        await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      }

      // Create the user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
      });

      if (createError) {
        console.error("Failed to create user:", createError);
        throw new Error("Failed to create account");
      }

      // Generate signup confirmation link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password: password!,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (linkError || !linkData?.properties?.action_link) {
        console.error("Failed to generate signup link:", linkError);
        // Clean up the created user
        if (newUser?.user?.id) {
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        }
        throw new Error("Failed to generate confirmation link");
      }

      actionUrl = linkData.properties.action_link;
      console.log(`Generated signup confirmation link for ${email}`);

    } else {
      // Recovery flow
      const { data, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (resetError) {
        console.error("Failed to generate reset link:", resetError);
        // Don't reveal if email exists or not for security
        return new Response(
          JSON.stringify({ success: true, message: "If an account exists, a reset email will be sent" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!data?.properties?.action_link) {
        console.error("No action link generated");
        return new Response(
          JSON.stringify({ success: true, message: "If an account exists, a reset email will be sent" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      actionUrl = data.properties.action_link;
      console.log(`Generated password reset link for ${email}`);
    }

    const { subject, html } = getEmailContent(type, actionUrl);

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alpivion Network <noreply@alpivionnetwork.com>",
        to: [email],
        subject,
        html,
      }),
    });

    const resendData = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", resendData);
      throw new Error("Failed to send email");
    }

    console.log(`${type} email sent successfully to ${email}`, resendData);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-auth-email function:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
