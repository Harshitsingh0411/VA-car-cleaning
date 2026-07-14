import { motion } from "motion/react";
import { ShieldCheck, Heart, Users, Target, Calendar, Award } from "lucide-react";

const values = [
  {
    icon: <ShieldCheck size={28} className="text-secondary" />,
    title: "Uncompromising Quality",
    description: "We use pH-balanced materials and top-tier polymers to keep your luxury car protected."
  },
  {
    icon: <Heart size={28} className="text-secondary" />,
    title: "Eco-Friendly Care",
    description: "We care about the planet. Our operations utilize biodegradable, water-minimizing agents."
  },
  {
    icon: <Users size={28} className="text-secondary" />,
    title: "Trained Detailers",
    description: "Every technician on our team completes our rigorous multi-week detailing academy."
  },
  {
    icon: <Target size={28} className="text-secondary" />,
    title: "Ultimate Convenience",
    description: "We fit your schedule perfectly. No waiting at a physical workshop—we come directly to you."
  }
];

const team = [
  {
    name: "Vikram Aditya",
    role: "Founder & Master Detailer",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
    quote: "Keeping high-performance machines pristine is our absolute lifelong passion."
  },
  {
    name: "Arjun Singh",
    role: "Lead Detailing Technician",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
    quote: "Every microscopic line and vent deserves premium attention. Showroom look, guaranteed."
  },
  {
    name: "Priya Sharma",
    role: "Head of Operations & Support",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    quote: "A seamless booking, on-time arrival, and absolute customer satisfaction is my metric."
  }
];

export default function AboutPage() {
  return (
    <div className="pt-24 min-h-screen bg-light">
      {/* Banner */}
      <div className="bg-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold tracking-wider uppercase text-sm mb-4 block"
          >
            Who We Are
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-extrabold mb-6"
          >
            Crafting the Showroom Shine
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto"
          >
            VA Car Cleaning Service stands for professional care, absolute premium precision, and uncompromising quality delivered to your door.
          </motion.p>
        </div>
      </div>

      {/* Main Story */}
      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative h-[450px] rounded-[32px] overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=1000"
              alt="Deep luxury detailing"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4 block">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-dark mb-6">
              Empowering Car Enthusiasts with Precision
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Founded in 2024, VA Car Cleaning was born out of a desire to redefine the standard car wash. We noticed that traditional garages used abrasive equipment, recycled water, and low-grade materials that left micro-scratches on beautiful paint.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We decided to do things differently. We built a luxury mobile detailing service that delivers superior pH-neutral foam technology, high-power water recovery vacuums, and certified ceramic coatings directly to our customers. To date, we have beautified more than 1,000 vehicles.
            </p>
          </motion.div>
        </div>

        {/* Mission / Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 p-10 rounded-[32px] border border-primary/10"
          >
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-dark mb-4">
              Our Mission
            </h3>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              To deliver pristine detailing convenience that saves water, uses modern eco-safe chemicals, and restores every vehicle to its peak aesthetic potential without disrupting our clients' day.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/5 p-10 rounded-[32px] border border-secondary/10"
          >
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-dark mb-6">
              <Award size={24} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-dark mb-4">
              Our Vision
            </h3>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              To become India's primary brand for doorstep luxury car detailing services and create hundreds of meaningful, flexible part-time employment opportunities for students and young freelancers.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold uppercase tracking-wider text-sm mb-4 block">
              Beliefs & Standard
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-dark">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-lg text-center"
              >
                <div className="w-14 h-14 bg-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {val.icon}
                </div>
                <h3 className="text-lg font-heading font-extrabold text-dark mb-3">
                  {val.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Executive Detailing Team */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold uppercase tracking-wider text-sm mb-4 block">
              Detallers
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-dark">
              Meet the Detailing Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl group"
              >
                <div className="h-80 relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/25 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl font-heading font-extrabold text-white">
                      {member.name}
                    </h3>
                    <p className="text-secondary text-sm font-semibold">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-dark text-white">
                  <p className="text-gray-300 italic text-sm text-center">
                    "{member.quote}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
