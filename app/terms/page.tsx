import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — My Bonnet",
  description: "Terms of service for My Bonnet, South Africa's mechanic marketplace.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink text-white px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="mt-3 text-slate-300 text-sm">
            Last updated: May 2026 &middot; Effective immediately upon use
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <div className="space-y-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft text-slate-700 leading-7">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. About My Bonnet</h2>
            <p>
              My Bonnet (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a South African online marketplace
              that connects vehicle owners (&ldquo;drivers&rdquo;) with automotive repair workshops
              (&ldquo;workshops&rdquo;). We do not perform mechanical work ourselves; we provide a
              platform that facilitates introductions, quote requests, and reviews between drivers and
              independent workshops.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Acceptance of Terms</h2>
            <p>
              By accessing or using My Bonnet website, mobile experience, or any related services,
              you confirm that you are at least 18 years old, have read and understood these Terms, and
              agree to be bound by them. If you do not agree, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate and truthful information when creating an account or submitting a quote request.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must not use the platform to post fraudulent, misleading, or defamatory content.</li>
              <li>You must not attempt to circumvent the platform by contacting workshops discovered through My Bonnet in order to avoid paying lead fees.</li>
              <li>You must not use automated tools to scrape, crawl, or extract data from My Bonnet without prior written consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Workshop Listing Terms</h2>
            <p>
              Workshops that register on My Bonnet agree to the following additional conditions:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Listing information (name, services, location, contact details) must be accurate and kept up to date.</li>
              <li>Workshops may not list services they are not licensed or equipped to perform.</li>
              <li>Reviews must not be solicited, incentivised, or fabricated. Manipulation of ratings is grounds for removal.</li>
              <li>My Bonnet reserves the right to verify, suspend, or remove any workshop listing at its discretion, particularly where fraud or consumer harm is suspected.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Payment Terms and Lead Fees</h2>
            <p>
              Where applicable, workshops on paid subscription plans are charged lead fees as described
              in their subscription agreement. Lead fees apply when a verified quote request is
              delivered to the workshop via the platform. Fees are billed monthly via Paystack or as
              otherwise agreed in writing. All prices are quoted in South African Rand (ZAR) and
              exclude VAT unless stated otherwise.
            </p>
            <p className="mt-3">
              Disputes over lead fees must be raised within 14 days of the invoice date by contacting
              support@thebonnet.co.za. Chargebacks raised without prior notice may result in account
              suspension.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. AI Diagnosis Disclaimer</h2>
            <p>
              My Bonnet may offer AI-assisted vehicle diagnosis or symptom descriptions as a
              convenience tool. <strong>This is not a substitute for professional mechanical advice.</strong>{" "}
              AI-generated content may be inaccurate, incomplete, or unsuitable for your specific
              vehicle. Always consult a qualified mechanic before authorising any repair work. The
              Bonnet accepts no liability for decisions made solely on the basis of AI-generated
              vehicle assessments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Limitation of Liability</h2>
            <p>
              My Bonnet is a platform, not a party to any contract between a driver and a workshop.
              We do not guarantee the quality of work performed by listed workshops. To the maximum
              extent permitted by South African law, My Bonnet shall not be liable for any direct,
              indirect, incidental, or consequential loss arising from the use of workshops found
              through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Dispute Resolution</h2>
            <p>
              If you have a dispute with My Bonnet, please contact us first at support@thebonnet.co.za.
              We will endeavour to resolve disputes amicably within 15 business days. If a resolution
              cannot be reached, disputes shall be referred to mediation in accordance with the
              Arbitration Act 42 of 1965 (South Africa) before any legal proceedings are commenced.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Republic of
              South Africa. You consent to the exclusive jurisdiction of the courts of South Africa for
              any dispute arising from these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of My Bonnet after notice of
              an update constitutes acceptance of the revised Terms. We will notify registered users by
              email for material changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact</h2>
            <p>
              For questions about these Terms, please email{" "}
              <a href="mailto:legal@thebonnet.co.za" className="text-fire underline">
                legal@thebonnet.co.za
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
