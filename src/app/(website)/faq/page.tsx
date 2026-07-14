import { PageBanner } from "@/components/shared/page-banner";

const faqs = [
  { q: "Are your products 100% organic?", a: "Yes, all our products are grown using organic farming practices without synthetic pesticides or fertilizers." },
  { q: "Do you deliver to my area?", a: "We currently deliver across Maharashtra. Contact us to check availability for your specific location." },
  { q: "How do I place an order?", a: "You can browse our products, fill in the enquiry form, or reach out to us directly via phone or WhatsApp." },
  { q: "Do you offer bulk/wholesale pricing?", a: "Absolutely! We supply to restaurants, stores, and businesses. Contact us for wholesale pricing." },
  { q: "What is your return policy?", a: "We take pride in our fresh produce. If you're not satisfied, please contact us within 24 hours of delivery." },
  { q: "Can I visit the farm?", a: "Yes, we welcome visitors! Please contact us in advance to schedule a farm visit." },
  { q: "What payment methods do you accept?", a: "We accept UPI, bank transfer, and cash on delivery for local orders." },
  { q: "How fresh is your produce?", a: "Most produce is harvested within 24 hours of delivery to ensure maximum freshness and nutrition." },
];

export default function FAQPage() {
  return (
    <>
      <PageBanner
        backgroundImage="/images/mango-tree-banner.jpg"
        badge="Help Center"
        heading="Frequently Asked Questions"
        highlightedWord="Questions"
        subtitle="Everything you need to know about Bhole Farms."
        primaryCTA={{ label: "Ask a Question", href: "/contact" }}
        secondaryCTA={{ label: "Explore Products", href: "/products" }}
      />

      {/* FAQ Accordion */}
      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-2xl bg-white border border-border/40 overflow-hidden transition-all hover:shadow-md open:shadow-lg open:border-primary/30" style={{ animationDelay: `${i * 0.05}s` }}>
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 font-heading font-semibold text-foreground list-none">
                  <span className="text-sm md:text-base">{faq.q}</span>
                  <svg className="w-5 h-5 text-muted-foreground transition-transform duration-300 group-open:rotate-180 shrink-0 ml-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                </summary>
                <div className="border-t border-border/40 px-6 py-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 text-center">
            <div className="rounded-2xl bg-white border border-border/40 p-8 shadow-sm">
              <h2 className="text-xl font-heading font-bold">Still have questions?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Can&apos;t find what you&apos;re looking for? Reach out to us directly.</p>
              <a href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-button font-semibold text-white hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
