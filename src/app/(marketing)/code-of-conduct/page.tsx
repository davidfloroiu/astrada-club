import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Code of Conduct",
  description: "The standards that keep Astrada a room worth being in.",
};

export default function CodeOfConductPage() {
  return (
    <LegalPage
      title="Code of Conduct"
      updated="June 21, 2026"
      intro="Astrada works because of who&rsquo;s in the room and how they treat each other. This is the short version of what we expect."
    >
      <h2>The spirit</h2>
      <p>
        Treat every member the way you&rsquo;d want to be treated by a peer who
        respects your time and your work. Be generous, be honest, and assume good
        intent. The point of Astrada is real relationships between real builders.
      </p>

      <h2>What we expect</h2>
      <ul>
        <li><strong>Be real.</strong> Show up as yourself. No posturing, no inflated claims.</li>
        <li><strong>Be useful.</strong> Share what you know. Make introductions you&rsquo;d stand behind.</li>
        <li><strong>Respect confidentiality.</strong> What&rsquo;s said off the record stays off the record.</li>
        <li><strong>Respect time.</strong> Follow through on what you commit to, including intros and replies.</li>
      </ul>

      <h2>What isn&rsquo;t tolerated</h2>
      <ul>
        <li>Harassment, discrimination, or personal attacks of any kind.</li>
        <li>Pitching, spamming, or treating members as a lead list.</li>
        <li>Sharing private discussions, member details, or event conversations outside the club.</li>
        <li>Misrepresenting who you are or what you&rsquo;ve built.</li>
      </ul>

      <h2>Confidentiality</h2>
      <p>
        Dinners and private rooms are off the record by default. Don&rsquo;t
        screenshot, forward, or attribute what members share without their
        explicit okay. Trust is the whole product.
      </p>

      <h2>Reporting</h2>
      <p>
        If something feels off, tell us. Email{" "}
        <a href="mailto:hello@astradaclub.com">hello@astradaclub.com</a> and
        we&rsquo;ll handle it discreetly and quickly.
      </p>

      <h2>Enforcement</h2>
      <p>
        We take this seriously. Depending on what happened, we may give a warning,
        suspend access, or remove a member without refund. Keeping the room
        worth being in matters more than keeping any one seat filled.
      </p>
    </LegalPage>
  );
}
