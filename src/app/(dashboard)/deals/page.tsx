import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { DealsGrid } from "@/components/deals/DealsGrid";

export const metadata = { title: "Perks" };

export default function PerksPage() {
  return (
    <>
      <PageHeader
        title="Member Perks"
        subtitle="Perks we're lining up for members on the tools founders actually use. We'll only ever list a partner here once it's real — so for now, here's what's coming."
        action={<Badge tone="neutral">In progress</Badge>}
      />
      <DealsGrid />
    </>
  );
}
