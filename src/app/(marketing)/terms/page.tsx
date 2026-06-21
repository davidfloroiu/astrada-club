import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern Astrada Club membership.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 21, 2026"
      intro="These terms govern your membership in Astrada Club. By joining, you agree to them. We&rsquo;ve written them to be readable rather than impressive."
    >
      <h2>Membership &amp; eligibility</h2>
      <p>
        Astrada is a private, invitation-minded community for founders building
        real companies. Membership is personal to you, may not be shared or
        transferred, and we may decline or end a membership at our discretion,
        consistent with these terms.
      </p>

      <h2>Billing &amp; renewals</h2>
      <ul>
        <li>Astrada is a paid membership. Pricing is shared with applicants upon acceptance and confirmed at checkout before any charge.</li>
        <li>Billing and renewals are handled by <strong>Whop</strong>. Your plan renews automatically until you cancel.</li>
        <li>You can cancel anytime through Whop; cancellation stops future renewals and takes effect at the end of your current period.</li>
        <li>Except where required by law, payments are non-refundable.</li>
      </ul>

      <h2>Member conduct</h2>
      <p>
        Membership comes with a simple expectation: be a good member of the
        room. You agree to follow our{" "}
        <a href="/code-of-conduct">Code of Conduct</a>. Violations can result in
        suspension or removal without refund.
      </p>

      <h2>Confidentiality</h2>
      <p>
        Much of what makes Astrada valuable happens off the record. What&rsquo;s
        shared in the community, at dinners, and in private rooms is meant to
        stay among members. Don&rsquo;t republish or attribute it outside the
        club without permission.
      </p>

      <h2>Content &amp; intellectual property</h2>
      <p>
        You keep ownership of what you post. By sharing it in the community, you
        give us a limited license to display it to other members as part of
        running the club. The Astrada name, brand, and site are ours.
      </p>

      <h2>Disclaimers</h2>
      <p>
        Astrada is a community, not professional advice. Nothing here is legal,
        financial, tax, or investment advice. The service is provided
        &ldquo;as is,&rdquo; and we&rsquo;re actively building features as the
        founding circle grows.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Astrada is not liable for
        indirect or consequential damages arising from your use of the community.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the club evolves. We&rsquo;ll post changes
        here and update the date above, and notify members of material changes.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:hello@astradaclub.com">hello@astradaclub.com</a>.
      </p>
    </LegalPage>
  );
}
