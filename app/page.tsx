import { Hero } from '@/components/hero'
import { VespaProducts } from '@/components/vespa-products'
import { VespaShowcase } from '@/components/vespa-showcase'
import { Services } from '@/components/services'
import { Location } from '@/components/location'
import { Footer } from '@/components/footer'
import { Navigation } from '@/components/navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <VespaProducts />
        <VespaShowcase />
        <Services />
        <Location />
      </main>
      <Footer />
    </div>
  )
}
