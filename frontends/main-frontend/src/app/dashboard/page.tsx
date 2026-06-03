import { DashboardOverview } from "@/components/organisms/DashboardOverview";
import { DeleteAccountSection } from "@/components/organisms/DeleteAccountSection";
import { AppTemplate } from "@/components/templates/AppTemplate";

export default function DashboardPage() {
  return (
    <AppTemplate>
      <DashboardOverview />
      <div className="mt-10">
        <DeleteAccountSection />
      </div>
    </AppTemplate>
  );
}
