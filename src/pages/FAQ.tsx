import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
const FAQ = () => {
  useEffect(() => {
    document.title = "FAQ | Alpivion Network";
  }, []);
  return <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
            Frequently Asked Questions
          </h1>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What is Alpivion Network?</h2>
              <p>Alpivion Network is a flight simulation community focused on airline-style operations, group flights, and aviation discussion. We bring together virtual pilots who share a passion for realistic, structured flight simulation. Our goal is to bring back the close-knit flight simulation community that once defined the hobby.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How do I join a group flight?</h2>
              <p>To join a group flight, create an account and navigate to the Group Flights section. Browse upcoming flights and click "Register" on any flight you'd like to participate in. Make sure to check the difficulty level before registering, as some of them get challenging!</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What simulators are supported?</h2>
              <p>We primarily support Microsoft Flight Simulator (MSFS) and X-Plane. However, pilots using other simulators are welcome to join the community and participate in discussions and flights.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Do I need any special equipment?</h2>
              <p>
                No special equipment is required beyond a flight simulator and a stable internet connection. However, having a headset for voice communication during group flights is recommended.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How do I report an issue?</h2>
              <p>You can report issues through our Report Issue page. Please provide as much detail as possible so our team can investigate and assist you effectively.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Is there a Discord server?</h2>
              <p>Yes! We have an active Discord server where members coordinate flights, share experiences, and connect with other virtual pilots. Join us in our Discord community linked at various places on our website such as the signup page, dashboard, as well as the bottom of our website.</p>
            </section>
          </div>

          <p className="mt-12 text-sm text-muted-foreground">
            Last updated: February 2026
          </p>
        </div>
      </main>
      <Footer />
    </div>;
};
export default FAQ;