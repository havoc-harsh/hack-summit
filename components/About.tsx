import { motion } from "framer-motion";
import { HeartPulse, Activity, CheckCircle, ShieldCheck, Lightbulb, Users } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-extrabold text-gray-900">
            About Our Platform
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            Empowering healthcare institutions with real-time insights, seamless coordination, and AI-driven decision-making for efficient patient care.
          </p>
        </motion.div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Our Mission */}
          <Card
            title="Our Mission"
            description="To bridge the gap between patients and healthcare providers by delivering a unified, data-driven ecosystem for smarter healthcare management."
            icon={<HeartPulse className="w-10 h-10 text-blue-600" />}
          />

          {/* Our Vision */}
          <Card
            title="Our Vision"
            description="To revolutionize healthcare accessibility by integrating AI, automation, and real-time analytics into a comprehensive hospital management system."
            icon={<Lightbulb className="w-10 h-10 text-cyan-600" />}
          />

          {/* Why Choose Us */}
          <Card
            title="Why Choose Us?"
            icon={<ShieldCheck className="w-10 h-10 text-green-600" />}
          >
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                AI-powered real-time hospital resource tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Automated ambulance dispatch & triage system
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Secure digital health records & patient portals
              </li>
            </ul>
          </Card>

          {/* Community Impact */}
          <Card
            title="Community Impact"
            description="We connect hospitals, ambulance providers, and patients in a collaborative network to improve healthcare accessibility and emergency response times."
            icon={<Users className="w-10 h-10 text-indigo-600" />}
          />

          {/* Innovation & Security */}
          <Card
            title="Innovation & Security"
            description="We ensure data security and compliance with healthcare standards while driving innovation in medical infrastructure management."
            icon={<ShieldCheck className="w-10 h-10 text-purple-600" />}
          />

          {/* Data-Driven Approach */}
          <Card
            title="Data-Driven Approach"
            description="Harnessing the power of AI and real-time analytics, we provide actionable insights for hospitals to optimize resources and improve patient outcomes."
            icon={<Activity className="w-10 h-10 text-teal-600" />}
          />
        </div>
      </div>
    </section>
  );
}

/* Reusable Card Component */
function Card({ title, description, icon, children }) {
  return (
    <motion.div 
      className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200"
      whileHover={{ y: -5 }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="p-3 rounded-lg bg-gray-100">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      </div>
      {description && <p className="text-gray-600">{description}</p>}
      {children}
    </motion.div>
  );
}
