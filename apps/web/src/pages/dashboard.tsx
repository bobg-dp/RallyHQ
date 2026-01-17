import Seo from "../components/Seo";
import YourProfile from "@/components/custom/dashboard/YourProfile";
import UserPermissions from "@/components/custom/dashboard/UserPermissions";
import Codrivers from "@/components/custom/dashboard/Codrivers";
import Cars from "@/components/custom/dashboard/Cars";

export default function Dashboard() {
  return (
    <>
      <Seo
        title="Dashboard | React Template"
        description="View your dashboard on the React TSX Tailwind template."
      />
      <div className="min-h-screen bg-background">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <YourProfile />
                <UserPermissions />
                <Codrivers />
                <Cars />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
