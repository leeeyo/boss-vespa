import type { ReactNode } from 'react'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { Clock, MapPin, Phone } from 'lucide-react'

import showroom from '@/public/images/showcase4.jpg'

export function Location() {
  return (
    <section id="contact" className="py-20 px-4 bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <div className="container mx-auto">
        <div className="text-center mb-12 space-y-3 overflow-visible">
          <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent overflow-visible whitespace-normal wrap-break-words px-2 py-1">
            Notre Magasin
          </h2>
          <div className="space-y-1 text-lg text-white/80 max-w-3xl mx-auto">
            <p>
              Passez au showroom pour essayer les Vespas, sélectionner vos accessoires et finaliser votre projet avec notre
              équipe.
            </p>
            <p className="text-base text-white/60">
              Visit our colorful showroom in Mahdia to test-ride, pick accessories and co-create your Vespa build.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur">
            <CardContent className="p-8 space-y-6 text-white">
              <div className="space-y-6">
                <InfoRow
                  icon={<MapPin className="w-6 h-6 text-white" />}
                  title="Adresse"
                  content={
                    <>
                      Boss Vespa<br />
                      Avenue principale, Mahdia (Tunisie)
                    </>
                  }
                  gradient="from-yellow-400 to-orange-500"
                />
                <InfoRow
                  icon={<Phone className="w-6 h-6 text-white" />}
                  title="Contact"
                  content={
                    <>
                      Téléphone · +216 97 310 394<br />
                    </>
                  }
                  gradient="from-red-400 to-pink-500"
                />
                <InfoRow
                  icon={<Clock className="w-6 h-6 text-white" />}
                  title="Horaires"
                  content={
                    <>
                      7 jours sur 7<br />
                      09h00 → 18h00
                    </>
                  }
                  gradient="from-blue-400 to-cyan-500"
                />
              </div>
              <div className="rounded-2xl bg-linear-to-r from-amber-500 via-rose-500 to-sky-500 p-6 text-white shadow-lg">
                <p className="text-sm uppercase tracking-[0.2em]">Services</p>
                <p className="text-base">
                  Essais privés, ateliers custom, retrait express ou livraison dans tout le pays.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur">
              <CardContent className="p-0 h-[300px]">
                <div className="relative h-full">
                  <Image
                    src={showroom}
                    alt="Showroom Boss Vespa à Mahdia"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-sm uppercase tracking-[0.3em] text-white/80">Mahdia • TN</p>
                    <p className="text-2xl font-semibold">Un showroom vivant et coloré</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur">
              <CardContent className="p-0 h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3252.8951889473676!2d11.0365687!3d35.5121719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130223bed1e884f9%3A0x4a60cdd473de3149!2sBoss%20Vespa!5e0!3m2!1sen!2stn!4v1700000000000!5m2!1sen!2stn"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Boss Vespa Location"
                  className="w-full h-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

type InfoRowProps = {
  icon: ReactNode
  title: string
  content: React.ReactNode
  gradient: string
}

function InfoRow({ icon, title, content, gradient }: InfoRowProps) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-12 h-12 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg mb-1 text-white">{title}</h3>
        <p className="text-white/70 leading-relaxed">{content}</p>
      </div>
    </div>
  )
}
