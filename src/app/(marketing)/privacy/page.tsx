import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description: "How Astrada Club collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 21, 2026"
      intro="Astrada Club is a private community for founders. This policy explains what information we collect, how we use it, and the choices you have. We keep it short and plain on purpose."
    >
      <h2>Information we collect</h2>
      <p>
        When you sign in or become a member, we receive your name, email
        address, profile photo, and account identifier from{" "}
        <strong>Whop</strong>, which powers our sign-in and billing. We also keep
        a record of your membership status and the basic activity needed to run
        the members&rsquo; area (for example, that you signed in).
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To verify your membership and give you access to the members&rsquo; area.</li>
        <li>To operate the community &mdash; chat, events, the member directory, and introductions.</li>
        <li>To contact you about your membership, events, and important updates.</li>
        <li>To keep the club safe and enforce our Code of Conduct.</li>
      </ul>

      <h2>Payments</h2>
      <p>
        Membership billing is handled by Whop and its payment processors. We do
        not see or store your full card number or banking details. Whop&rsquo;s
        handling of your payment information is governed by{" "}
        <a href="https://whop.com/privacy" target="_blank" rel="noopener noreferrer">
          Whop&rsquo;s privacy policy
        </a>
        .
      </p>

      <h2>Sharing</h2>
      <p>
        We don&rsquo;t sell your personal information. We share it only with the
        service providers that help us run Astrada (such as Whop and our hosting
        provider), and where required by law. Information you choose to share
        inside the community &mdash; your member profile, messages, or what you
        say at an event &mdash; is visible to other members.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep your information for as long as you&rsquo;re a member and for a
        reasonable period afterward to meet legal, accounting, and operational
        needs. You can ask us to delete your account information at any time.
      </p>

      <h2>Your choices</h2>
      <p>
        You can access, correct, or delete your personal information by emailing
        us. You can cancel your membership at any time through Whop, and you can
        opt out of non-essential emails using the unsubscribe link.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        As Astrada grows, we may update this policy. We&rsquo;ll post the new
        version here and update the date above. If the changes are significant,
        we&rsquo;ll let members know directly.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your privacy? Email{" "}
        <a href="mailto:hello@astradaclub.com">hello@astradaclub.com</a>.
      </p>
    </LegalPage>
  );
}
