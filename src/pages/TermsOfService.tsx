import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Terms of Service | Alpivion Network";
  }, []);

  return <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">Alpivion Network – Terms of Service
        </h1>
          
          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>Welcome to Alpivion Network. By joining or interacting with Alpivion Network, you agree to comply with these Terms of Service. These terms apply to all channels, events, bots, and content within the community.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Community Purpose</h2>
              <p>Alpivion Network is a flight simulation community focused on airline-style operations, group flights, and aviation discussion. The community is intended for collaborative, educational, and recreational purposes related to flight simulation.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Conduct</h2>
              <p>Members must act respectfully toward others. Prohibited behavior includes, but is not limited to, harassment, threats, or hate speech. Sharing illegal content or pirated software, Disrupting events or sabotaging community operations. Impersonating staff or other members. Excessive spamming, trolling, or inappropriate content. Failure to follow these rules may result in warnings, temporary suspension, or permanent removal from the community.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Content and Intellectual Property</h2>
              <p>All user-generated content (images, recordings, flight plans, messages) is owned by the creator, but you grant Alpivion Network the right to display it within the community.

Do not post copyrighted or illegal material.
            </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
              <p>
                Alpivion Network shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Privacy and Data</h2>
              <p>Alpivion Network does not sell or distribute personal data. Bots may collect basic information (Discord username, messages in public channels) for operational purposes, such as flight logs, event tracking, and METAR commands.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting.</p>
            </section>
          </div>

          <p className="mt-12 text-sm text-muted-foreground">Last updated: February 2026
        </p>
        </div>
      </main>
      <Footer />
    </div>;
};
export default TermsOfService;