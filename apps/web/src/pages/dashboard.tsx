import Seo from '../components/Seo';
import { motion } from "framer-motion";
import YourProfile from "@/components/custom/YourProfile";

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
                <motion.article
                  key="dasdss"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  dashboard
                </motion.article>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
