export function StatsSection() {
  const stats = [
    { number: "101K", label: "TICKETS SOLD", color: "bg-green-500" },
    { number: "75K", label: "GREAT CUSTOMERS", color: "bg-primary" },
    { number: "350", label: "HAPPY CLIENTS", color: "bg-yellow-500" },
    { number: "105", label: "SUPPORTER & PARTNER", color: "bg-green-700" },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-green-500 to-primary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-4xl font-bold">{stat.number}</div>
              <div className="text-sm uppercase tracking-wider opacity-90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
