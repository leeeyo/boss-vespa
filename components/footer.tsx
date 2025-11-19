import { Facebook, Instagram, MapPin, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white pl-30">
      <div className="absolute inset-0 bg-[url('/images/showcase3.jpg')] opacity-10 bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70 mb-2">Boss Vespa</p>
            <h3 className="text-3xl font-black mb-4">Mahdia, Tunisie</h3>
            <p className="text-white/90 mb-2">
              Ventes, personnalisation atelier, accessoires et livraison nationale.
            </p>
            <p className="text-sm text-white/80">
              Sales, bespoke workshop, matching gear and nationwide delivery.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Liens / Quick Links</h4>
            <ul className="space-y-2 text-white/90">
              {[
                { label: 'Accueil · Home', href: '#home' },
                { label: 'Nos Vespas · Our Vespas', href: '#vespas' },
                { label: 'Personnalisation · Custom', href: '#custom' },
                { label: 'Livraison · Delivery', href: '#delivery' },
                { label: 'Contact', href: '#contact' },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold">Contact</h4>
            <div className="flex items-center gap-3 text-white/90">
              <MapPin size={18} />
              <span>Avenue principale, Mahdia</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Phone size={18} />
              <span>+216 97 310 394</span>
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-sm text-white/80">
          <p>
            &copy; {new Date().getFullYear()} Boss Vespa — Tous droits réservés · All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
