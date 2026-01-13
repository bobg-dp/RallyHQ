import Seo from "../components/Seo";
import YourProfile from "@/components/custom/YourProfile";
import Codrivers from "@/components/custom/Codrivers";

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
                <Codrivers />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
