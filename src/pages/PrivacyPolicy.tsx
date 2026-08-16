import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | Alpivion Network";
  }, []);
  return <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
            Alpivion Network – Privacy Policy
          </h1>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p>Alpivion Network (“we,” “our,” or “us”) values your privacy. This Privacy Policy explains how we collect, use, store, and protect personal information when you use our website, Discord server, and related services. By accessing or using Alpivion Network, you agree to the practices described in this policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              <p>Alpivion Network collects information that you voluntarily provide when using our services. This may include your username or display name, email address, Discord user ID and username when linking accounts, and any information you submit through contact forms, issue reports, or applications.

When you visit our website, certain information may be collected automatically. This information can include your IP address, browser type, device information, and data related to pages visited and interactions on the site. Automatically collected information is used for security purposes, analytics, and to improve site performance and reliability.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <p>If you choose to connect your Discord account to Alpivion Network, we collect your Discord user ID and basic profile information. This information is used to assign roles and badges and to manage access within the community. Alpivion Network does not access private messages or unrelated Discord data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. How We Use Your Information</h2>
              <p>The information we collect is used to operate and maintain Alpivion Network services, manage user accounts and training access, assign and manage community roles, communicate important updates and announcements, improve website functionality and content, and enforce community rules while preventing abuse.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Sharing</h2>
              <p>Alpivion Network does not sell or rent personal information. Limited data may be shared only when required by law, when necessary to protect Alpivion Network, its users, or its services, or when working with trusted third-party service providers such as hosting, analytics, or email platforms that support our operations.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies</h2>
              <p>Our website may use cookies or similar technologies to maintain user sessions, improve usability, and collect basic analytics. You may disable cookies through your browser settings, although some features of the website may not function as intended.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Third-Party Services</h2>
              <p>
                Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites and encourage you to review their policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Security</h2>
              <p>Reasonable measures are taken to protect personal information, including the use of secure authentication methods, restricted access to sensitive data, and regular system monitoring. While we take these precautions seriously, no online service can guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
              <p>Personal information is retained only for as long as necessary to provide services or to meet operational or legal requirements. Users may request the deletion of their account data at any time through available support or contact channels.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Your Rights</h2>
              <p>Depending on your location, you may have the right to access your personal information, request corrections or deletion, or withdraw consent for certain uses of your data. Requests related to personal information can be submitted through our contact or support channels.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. International Users</h2>
              <p>Our website may contain links to third-party services such as Discord or YouTube. Alpivion Network is not responsible for the privacy practices or content of external platforms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to This Policy</h2>
              <p>Alpivion Network is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Policy Updates</h2>
              <p>This Privacy Policy may be updated from time to time. Any changes will be posted on this page with an updated revision date.</p>
            </section>
          </div>

          <p className="mt-12 text-sm text-muted-foreground">Last updated: February 2026</p>
        </div>
      </main>
      <Footer />
    </div>;
};
export default PrivacyPolicy;