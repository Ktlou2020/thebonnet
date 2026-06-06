import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — My Bonnet",
  description: "POPIA-compliant privacy policy for My Bonnet, South Africa's mechanic marketplace.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink text-white px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-3 text-slate-300 text-sm">
            Last updated: May 2026 &middot; Compliant with POPIA (Protection of Personal Information Act 4 of 2013)
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <div className="space-y-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft text-slate-700 leading-7">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Who We Are</h2>
            <p>
              My Bonnet is a South African online marketplace for vehicle owners and automotive repair
              workshops. We are the responsible party for the personal information you provide to us,
              as defined under the Protection of Personal Information Act 4 of 2013 (&ldquo;POPIA&rdquo;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. What Personal Information We Collect</h2>
            <p>We may collect the following categories of personal information:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Identity information:</strong> name, surname, and profile details.</li>
              <li><strong>Contact information:</strong> email address and phone number.</li>
              <li><strong>Vehicle information:</strong> make, model, year, and service history you choose to share.</li>
              <li><strong>Usage data:</strong> pages visited, features used, search queries, and device information collected automatically.</li>
              <li><strong>Payment information:</strong> billing details processed by Paystack (we do not store card numbers).</li>
              <li><strong>Communications:</strong> messages sent through the platform, review text, and support correspondence.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Why We Collect and How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and manage your account.</li>
              <li>To match your quote request with relevant workshops.</li>
              <li>To send transactional communications (quote updates, sign-in links, receipts).</li>
              <li>To send service-related notifications via email or SMS (you may opt out at any time).</li>
              <li>To detect fraud, enforce our Terms of Service, and keep the platform safe.</li>
              <li>To improve the platform through aggregated, anonymised analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Third-Party Processors</h2>
            <p>We share personal information with the following service providers, each bound by appropriate data processing agreements:</p>
            <div className="mt-4 overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-4 py-3 text-left">Processor</th>
                    <th className="px-4 py-3 text-left">Purpose</th>
                    <th className="px-4 py-3 text-left">Data shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">Paystack</td>
                    <td className="px-4 py-3">Payment processing</td>
                    <td className="px-4 py-3">Email, billing amount</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">Twilio</td>
                    <td className="px-4 py-3">SMS notifications</td>
                    <td className="px-4 py-3">Phone number, message content</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">Cloudinary</td>
                    <td className="px-4 py-3">Image hosting &amp; optimisation</td>
                    <td className="px-4 py-3">Uploaded photo files</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">PostHog</td>
                    <td className="px-4 py-3">Product analytics</td>
                    <td className="px-4 py-3">Anonymised usage events</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Sentry</td>
                    <td className="px-4 py-3">Error monitoring</td>
                    <td className="px-4 py-3">Error context, anonymised session data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Retention</h2>
            <p>
              We retain personal information for as long as your account is active or as needed to
              provide our services. If you delete your account, we will delete or anonymise your
              personal information within 30 days, except where we are required to retain it for legal
              or tax purposes (up to 5 years as required by SARS regulations).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your Rights Under POPIA</h2>
            <p>
              As a data subject under POPIA, you have the following rights:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
              <li><strong>Correction:</strong> Ask us to correct inaccurate or incomplete information.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements.</li>
              <li><strong>Objection:</strong> Object to the processing of your personal information for direct marketing purposes.</li>
              <li><strong>Complaint:</strong> Lodge a complaint with the Information Regulator of South Africa at inforeg.org.za.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@thebonnet.co.za" className="text-fire underline">
                privacy@thebonnet.co.za
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption, hashed
              passwords, and access controls. While we take reasonable precautions, no internet
              transmission is completely secure. Please notify us immediately at
              security@thebonnet.co.za if you suspect unauthorised access to your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Cookies</h2>
            <p>
              We use essential cookies for authentication and functional cookies to remember your
              preferences. Analytics cookies are only placed with your consent. You can manage cookies
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users by
              email before material changes take effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact and Information Officer</h2>
            <p>
              For privacy enquiries or to exercise your POPIA rights, contact our Information Officer
              at{" "}
              <a href="mailto:privacy@thebonnet.co.za" className="text-fire underline">
                privacy@thebonnet.co.za
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
