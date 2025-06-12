import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">WHAT OUR CLIENTS SAY</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Roadrunner drew shrunk onto placed oh lonely goodness near contrary prideful regarding much falsome because
          soberly
        </p>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Avatar key={i} className="w-12 h-12">
                  <AvatarImage src={`/placeholder-user-${i}.jpg`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="bg-blue-500 text-white p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">Need help?</p>
                  <p className="text-sm">+84. 123 333 666</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">Email us</p>
                  <p className="text-sm">info@ticketbox.me</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
