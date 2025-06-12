import { CheckCircle, ShoppingBag, Ticket } from "lucide-react";
const features = [
  {
    icon: CheckCircle,
    title: "CHOOSE EVENTS AND TICKETS",
    description:
      "Browse a curated selection of events and easily pick the tickets that suit your interests.",
  },
  {
    icon: ShoppingBag,
    title: "BUY DIRECTLY FROM ORGANIZERS",
    description:
      "Purchase tickets securely from official event organizers with no hidden fees.",
  },
  {
    icon: Ticket,
    title: "RECEIVE TICKETS",
    description:
      "Get your tickets instantly via email and access them anytime from your account.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
