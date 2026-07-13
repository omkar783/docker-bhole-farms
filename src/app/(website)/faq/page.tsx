const faqs = [
  {
    q: "Are your products 100% organic?",
    a: "Yes, all our products are grown using organic farming practices without synthetic pesticides or fertilizers.",
  },
  {
    q: "Do you deliver to my area?",
    a: "We currently deliver across Maharashtra. Contact us to check availability for your specific location.",
  },
  {
    q: "How do I place an order?",
    a: "You can browse our products, fill in the enquiry form, or reach out to us directly via phone or WhatsApp.",
  },
  {
    q: "Do you offer bulk/wholesale pricing?",
    a: "Absolutely! We supply to restaurants, stores, and businesses. Contact us for wholesale pricing.",
  },
  {
    q: "What is your return policy?",
    a: "We take pride in our fresh produce. If you're not satisfied, please contact us within 24 hours of delivery.",
  },
  {
    q: "Can I visit the farm?",
    a: "Yes, we welcome visitors! Please contact us in advance to schedule a farm visit.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold">
        Frequently Asked Questions
      </h1>
      <div className="mt-8 max-w-3xl space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-lg border border-border bg-card"
          >
            <summary className="flex cursor-pointer items-center justify-between px-4 py-4 font-heading font-medium">
              {faq.q}
              <span className="text-muted-foreground transition-transform group-open:rotate-180">
                &#9660;
              </span>
            </summary>
            <div className="border-t border-border px-4 py-4 text-sm text-muted-foreground leading-relaxed">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
