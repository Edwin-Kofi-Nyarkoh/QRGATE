import { Card, CardContent } from "@/components/ui/card";

export function TestimonialsSection() {
  return (
    <section className="py-16">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="bg-background p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Need help?</p>
                <p className="text-sm">+233 59 834 6928</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Email us</p>
                <p className="text-sm">info@qrgates.me</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
