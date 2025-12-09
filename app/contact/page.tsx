'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { vespaProducts } from '@/data/vespa'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Le nom doit contenir au moins 2 caractères.',
  }),
  email: z.string().email({
    message: 'Email invalide.',
  }),
  phone: z.string().min(8, {
    message: 'Le numéro doit contenir au moins 8 caractères.',
  }),
  product: z.string().min(1, {
    message: 'Veuillez sélectionner un produit.',
  }),
  message: z.string().min(10, {
    message: 'Le message doit contenir au moins 10 caractères.',
  }),
})

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      product: '',
      message: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    console.log(values)
    
    setIsSubmitting(false)
    form.reset()
    
    toast({
      title: 'Demande envoyée !',
      description: 'Nous vous contacterons bientôt.',
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300">Contact</p>
          <h1 className="text-4xl md:text-6xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent px-2 py-1">
            Demander un Devis
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Remplissez le formulaire ci-dessous pour recevoir une offre personnalisée pour votre Vespa de rêve.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <CardContent className="p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/90">Nom</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Votre nom" 
                            autoComplete="name"
                            {...field} 
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400 focus:ring-amber-400/20"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="votre@email.com" 
                              type="email"
                              autoComplete="email"
                              {...field} 
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400 focus:ring-amber-400/20"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Téléphone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+216 ..." 
                              type="tel"
                              autoComplete="tel"
                              {...field} 
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400 focus:ring-amber-400/20"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/90">Modèle Vespa</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-amber-400 focus:ring-amber-400/20">
                              <SelectValue placeholder="Sélectionnez un modèle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-white/10 text-white">
                            {vespaProducts.map((product) => (
                              <SelectItem 
                                key={product.slug} 
                                value={product.name}
                                className="focus:bg-white/10 focus:text-white"
                              >
                                {product.name} - {product.subtitle}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/90">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Détails supplémentaires, préférences de couleur, etc..." 
                            className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400 focus:ring-amber-400/20" 
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-6 rounded-xl transition-all shadow-[0_4px_14px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.6)]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Envoi en cours...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send size={18} />
                        Envoyer la demande
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <div className="space-y-8">
            <Card className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] h-full">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-white">Adresse</h3>
                      <p className="text-white/70 leading-relaxed">
                        Boss Vespa<br />
                        Avenue principale, Mahdia
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-400 to-pink-500 flex items-center justify-center shrink-0 shadow-lg">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-white">Téléphone</h3>
                      <p className="text-white/70 leading-relaxed">
                        +216 97 310 394
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-white">Horaires</h3>
                      <p className="text-white/70 leading-relaxed">
                        7 jours sur 7<br />
                        09h00 → 18h00
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-linear-to-r from-amber-500 via-rose-500 to-sky-500 p-6 text-white shadow-lg mt-auto">
                  <p className="text-sm uppercase tracking-[0.2em] mb-2 font-bold opacity-80">Services</p>
                  <p className="text-base font-medium">
                    Essais privés, ateliers custom, retrait express ou livraison dans tout le pays.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
