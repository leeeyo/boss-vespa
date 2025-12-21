'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Loader2,
  LayoutGrid,
  List,
  Filter,
  X,
  ChevronDown,
  Bike,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  _id: string
  name: string
  slug: string
  category: 'scooter' | 'accessory'
  price: number
  stock: number
  isActive: boolean
  images: string[]
  color?: string
}

type ViewMode = 'grid' | 'list'
type CategoryFilter = 'all' | 'scooter' | 'accessory'
type StatusFilter = 'all' | 'active' | 'inactive'
type SortBy = 'category' | 'name' | 'price-asc' | 'price-desc' | 'stock'

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('category')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetch('/api/products?isActive=all')
        .then((res) => res.json())
        .then((data) => {
          setProducts(data.products || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.slug.toLowerCase().includes(term) ||
        product.color?.toLowerCase().includes(term)
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(product => 
        statusFilter === 'active' ? product.isActive : !product.isActive
      )
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'category':
          // Scooters first, then accessories, then by name
          if (a.category !== b.category) {
            return a.category === 'scooter' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'stock':
          return a.stock - b.stock
        default:
          return 0
      }
    })

    return result
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy])

  // Stats
  const stats = useMemo(() => ({
    total: products.length,
    scooters: products.filter(p => p.category === 'scooter').length,
    accessories: products.filter(p => p.category === 'accessory').length,
    active: products.filter(p => p.isActive).length,
    inactive: products.filter(p => !p.isActive).length,
    lowStock: products.filter(p => p.stock < 5).length,
  }), [products])

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setSortBy('category')
  }

  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'category'

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" aria-label="Chargement en cours" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Link 
            href="/admin/dashboard" 
            className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors"
            aria-label="Retour au tableau de bord"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Gestion du Catalogue
          </h1>
          <p className="text-white/50 mt-2">
            {stats.total} produits • {stats.scooters} scooters • {stats.accessories} accessoires
          </p>
        </div>
        
        <Link href="/admin/products/new">
          <Button 
            className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow-lg shadow-amber-900/20"
            aria-label="Ajouter un nouveau produit"
          >
            <Plus size={18} className="mr-2" aria-hidden="true" />
            Nouveau Produit
          </Button>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
            <Input 
              placeholder="Rechercher par nom, slug ou couleur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 pl-11 h-12 text-white placeholder:text-white/40 focus:ring-amber-400/20 focus:border-amber-400/30"
              aria-label="Rechercher un produit"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                aria-label="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Toggle & View Mode */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-white/10 bg-white/5 hover:bg-white/10 text-white h-12 ${showFilters ? 'border-amber-400/50 bg-amber-400/10' : ''}`}
              aria-expanded={showFilters}
              aria-controls="filters-panel"
            >
              <Filter size={18} className="mr-2" aria-hidden="true" />
              Filtres
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 rounded-full bg-amber-400" aria-label="Filtres actifs" />
              )}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1" role="group" aria-label="Mode d'affichage">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-400 text-slate-900' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                aria-label="Vue grille"
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-400 text-slate-900' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                aria-label="Vue liste"
                aria-pressed={viewMode === 'list'}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div id="filters-panel" className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                Catégorie
              </label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/30"
                  aria-label="Filtrer par catégorie"
                >
                  <option value="all" className="bg-slate-800">Toutes ({stats.total})</option>
                  <option value="scooter" className="bg-slate-800">Scooters ({stats.scooters})</option>
                  <option value="accessory" className="bg-slate-800">Accessoires ({stats.accessories})</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                Statut
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/30"
                  aria-label="Filtrer par statut"
                >
                  <option value="all" className="bg-slate-800">Tous ({stats.total})</option>
                  <option value="active" className="bg-slate-800">Actifs ({stats.active})</option>
                  <option value="inactive" className="bg-slate-800">Inactifs ({stats.inactive})</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                Trier par
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/30"
                  aria-label="Trier les produits"
                >
                  <option value="category" className="bg-slate-800">Catégorie (Scooters d&apos;abord)</option>
                  <option value="name" className="bg-slate-800">Nom (A-Z)</option>
                  <option value="price-asc" className="bg-slate-800">Prix (croissant)</option>
                  <option value="price-desc" className="bg-slate-800">Prix (décroissant)</option>
                  <option value="stock" className="bg-slate-800">Stock (bas en premier)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Réinitialiser tous les filtres"
              >
                <X size={16} className="mr-2" aria-hidden="true" />
                Réinitialiser
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/50 text-sm">
          {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtré)'}
        </p>
        {stats.lowStock > 0 && (
          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full">
            ⚠️ {stats.lowStock} produit{stats.lowStock > 1 ? 's' : ''} en stock faible
          </span>
        )}
      </div>

      {/* Products Display */}
      <div className="space-y-6">
        {filteredProducts.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card 
                  key={product._id} 
                  className="bg-white/5 border-white/10 overflow-hidden hover:border-amber-400/30 transition-all group"
                >
                  <div className="relative h-48 w-full bg-slate-800">
                    {product.images?.[0] ? (
                      <Image 
                        src={product.images[0]} 
                        alt={`Image de ${product.name}`}
                        fill 
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <Package size={48} aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <div className={`p-2 rounded-xl ${product.category === 'scooter' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {product.category === 'scooter' ? <Bike size={18} aria-hidden="true" /> : <ShoppingBag size={18} aria-hidden="true" />}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${product.isActive ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'}`}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </div>
                    </div>
                    {product.stock < 5 && (
                      <div className="absolute bottom-4 left-4 px-2 py-1 rounded-md bg-rose-500/80 text-white text-[10px] font-bold uppercase tracking-widest">
                        Stock faible
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-white/40 truncate">{product.color || 'Couleur non spécifiée'}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-white font-mono">{product.price.toLocaleString()} TND</p>
                        <p className={`text-xs ${product.stock < 5 ? 'text-rose-400' : 'text-white/40'}`}>
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-white/5">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs py-1 h-9"
                        aria-label={`Modifier ${product.name}`}
                      >
                        <Edit2 size={14} className="mr-2" aria-hidden="true" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        className="px-3 border-white/10 bg-white/5 hover:bg-white/10 text-white py-1 h-9"
                        aria-label={product.isActive ? `Désactiver ${product.name}` : `Activer ${product.name}`}
                      >
                        {product.isActive ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="px-3 border-white/10 bg-white/5 hover:bg-rose-500/20 text-rose-400 py-1 h-9"
                        aria-label={`Supprimer ${product.name}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest">
                <div className="col-span-4">Produit</div>
                <div className="col-span-2">Catégorie</div>
                <div className="col-span-2 text-right">Prix</div>
                <div className="col-span-1 text-center">Stock</div>
                <div className="col-span-1 text-center">Statut</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              {/* Table Body */}
              <div role="list" aria-label="Liste des produits">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product._id}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors ${index !== filteredProducts.length - 1 ? 'border-b border-white/5' : ''}`}
                    role="listitem"
                  >
                    {/* Product Info */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                        {product.images?.[0] ? (
                          <Image 
                            src={product.images[0]} 
                            alt={`Image de ${product.name}`}
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10">
                            <Package size={20} aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">{product.name}</h3>
                        <p className="text-sm text-white/40 truncate">{product.color || 'Couleur non spécifiée'}</p>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 hidden md:flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${product.category === 'scooter' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {product.category === 'scooter' ? <Bike size={14} aria-hidden="true" /> : <ShoppingBag size={14} aria-hidden="true" />}
                      </div>
                      <span className="text-sm text-white/70 capitalize">{product.category === 'scooter' ? 'Scooter' : 'Accessoire'}</span>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 hidden md:block text-right">
                      <span className="font-bold font-mono text-white">{product.price.toLocaleString()} TND</span>
                    </div>

                    {/* Stock */}
                    <div className="col-span-1 hidden md:flex justify-center">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock < 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-white/70'}`}>
                        {product.stock}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 hidden md:flex justify-center">
                      <span className={`w-3 h-3 rounded-full ${product.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} aria-label={product.isActive ? 'Actif' : 'Inactif'} />
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        aria-label={`Modifier ${product.name}`}
                      >
                        <Edit2 size={14} aria-hidden="true" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        aria-label={product.isActive ? `Désactiver ${product.name}` : `Activer ${product.name}`}
                      >
                        {product.isActive ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white/10 bg-white/5 hover:bg-rose-500/20 text-rose-400"
                        aria-label={`Supprimer ${product.name}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>
                    </div>

                    {/* Mobile Extra Info */}
                    <div className="col-span-full md:hidden flex items-center justify-between text-sm pt-2 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.category === 'scooter' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {product.category === 'scooter' ? 'Scooter' : 'Accessoire'}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {product.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-white">{product.price.toLocaleString()} TND</span>
                        <span className="text-white/40 ml-2">• Stock: {product.stock}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Package className="w-16 h-16 text-white/10 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold text-white/60">Aucun produit trouvé</h3>
            <p className="text-white/40 mt-2">
              {hasActiveFilters 
                ? 'Essayez de modifier vos filtres ou votre recherche.'
                : 'Commencez par ajouter un produit à votre catalogue.'}
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="mt-6 border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
