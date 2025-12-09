'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { MapPin, Phone, Send, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
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
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/lib/cart-context'

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'Le prénom doit contenir au moins 2 caractères.',
  }),
  lastName: z.string().min(2, {
    message: 'Le nom doit contenir au moins 2 caractères.',
  }),
  email: z.string().email({
    message: 'Email invalide.',
  }),
  phone: z.string().min(8, {
    message: 'Le numéro doit contenir au moins 8 caractères.',
  }),
  address: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères.",
  }),
  city: z.string().min(2, {
    message: 'La ville doit contenir au moins 2 caractères.',
  }),
  postalCode: z.string().min(4, {
    message: 'Code postal invalide.',
  }),
  notes: z.string().optional(),
})

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      notes: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (items.length === 0) {
      toast({
        title: 'Panier vide',
        description: 'Votre panier est vide. Veuillez ajouter des produits.',
        variant: 'destructive',
      })
      router.push('/collection')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    console.log({ order: values, items })
    
    clearCart()
    setIsSubmitting(false)
    
    toast({
      title: 'Commande confirmée !',
      description: 'Nous avons bien reçu votre commande. Nous vous contacterons bientôt.',
    })
    
    router.push('/checkout/success')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300">Commande</p>
          <h1 className="text-4xl md:text-6xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent px-2 py-1">
            Finaliser la commande
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Veuillez remplir vos informations de livraison pour compléter votre commande.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <CardContent className="p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">Prénom</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Votre prénom" 
                                autoComplete="given-name"
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
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">Nom</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Votre nom" 
                                autoComplete="family-name"
                                {...field} 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400 focus:ring-amber-400/20"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
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
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Adresse de livraison</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Numéro et rue" 
                              autoComplete="street-address"
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
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">Ville</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Votre ville" 
                                autoComplete="address-level2"
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
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">Code Postal</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Code postal" 
                                autoComplete="postal-code"
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Notes de commande (optionnel)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Instructions spéciales pour la livraison..." 
                              className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400 focus:ring-amber-400/20" 
                              rows={3}
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
                          Traitement en cours...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send size={18} />
                          Confirmer la commande
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <Card className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    Votre commande
                  </h3>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item) => (
                      <div key={item.slug} className="flex gap-4 items-start text-sm">
                        <div className="bg-white/10 rounded-md w-12 h-12 shrink-0 overflow-hidden relative">
                           <Image src={item.images[0]} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-white/60 text-xs">{item.subtitle}</p>
                          <p className="text-amber-300 mt-1">x {item.quantity}</p>
                        </div>
                        <div className="text-white/80 font-medium">
                          {item.price}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-white/80">
                      <span>Sous-total</span>
                      <span className="font-semibold text-white">{getCartTotal()}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Livraison</span>
                      <span>Calculée à la commande</span>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg text-white">Total</span>
                    <span className="font-black text-2xl bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      {getCartTotal()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex gap-3">
                  <div className="mt-1">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-300 text-sm">Zone de livraison</h4>
                    <p className="text-white/70 text-xs mt-1">
                      Nous livrons dans toute la Tunisie. Les frais de livraison seront confirmés par téléphone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

