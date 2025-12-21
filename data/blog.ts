export type BlogPost = {
  slug: string
  title: string
  description: string
  content: string
  publishedAt: string
  updatedAt?: string
  image: string
  category: string
  tags: string[]
  author: {
    name: string
    role: string
  }
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'guide-achat-vespa-tunisie',
    title: 'Guide Complet d\'Achat d\'une Vespa en Tunisie',
    description: 'Tout ce que vous devez savoir avant d\'acheter votre première Vespa en Tunisie : modèles, prix, entretien et réglementation.',
    content: `
# Guide Complet d'Achat d'une Vespa en Tunisie

L'achat d'une Vespa est un investissement important. Ce guide vous aidera à faire le bon choix.

## Les Modèles Disponibles

En Tunisie, plusieurs modèles Vespa sont disponibles :
- **Vespa Primavera** : Idéale pour la ville
- **Vespa Sprint** : Plus sportive et dynamique
- **Vespa GTS** : Plus puissante pour les longs trajets

## Prix et Financement

Les prix varient selon le modèle et les options. Contactez-nous pour un devis personnalisé.

## Entretien et Maintenance

Une Vespa bien entretenue peut durer des décennies. Nous proposons des services d'entretien complets.
    `,
    publishedAt: '2024-12-15',
    image: '/images/showcase1.jpg',
    category: 'Guide',
    tags: ['achat', 'guide', 'tunisie', 'vespa'],
    author: {
      name: 'Boss Vespa',
      role: 'Équipe Boss Vespa',
    },
  },
  {
    slug: 'personnalisation-vespa-conseils',
    title: 'Personnalisation Vespa : Conseils et Tendances 2024',
    description: 'Découvrez les dernières tendances en matière de personnalisation Vespa et nos conseils pour créer un scooter unique.',
    content: `
# Personnalisation Vespa : Conseils et Tendances 2024

La personnalisation est au cœur de l'identité Vespa. Voici nos conseils.

## Couleurs Tendance

Cette année, les couleurs vives et les finitions métalliques sont à l'honneur.

## Accessoires Essentiels

- Pare-brise sur mesure
- Top case personnalisé
- Poignées en cuir
- Rétroviseurs chromés

## Notre Atelier

Notre équipe d'artisans peut réaliser toutes vos envies de personnalisation.
    `,
    publishedAt: '2024-12-10',
    image: '/images/showcase2.jpg',
    category: 'Personnalisation',
    tags: ['personnalisation', 'tendances', 'custom'],
    author: {
      name: 'Boss Vespa',
      role: 'Équipe Boss Vespa',
    },
  },
  {
    slug: 'entretien-maintenance-vespa',
    title: 'Entretien et Maintenance de votre Vespa',
    description: 'Guide pratique pour entretenir votre Vespa et la garder en parfait état. Conseils d\'experts et calendrier d\'entretien.',
    content: `
# Entretien et Maintenance de votre Vespa

Un entretien régulier prolonge la vie de votre Vespa.

## Entretien Quotidien

- Vérification des niveaux
- Contrôle des pneus
- Nettoyage régulier

## Entretien Mensuel

- Vidange d'huile
- Contrôle des freins
- Vérification de la chaîne

## Entretien Annuel

- Révision complète
- Changement des filtres
- Contrôle technique
    `,
    publishedAt: '2024-12-05',
    image: '/images/showcase3.jpg',
    category: 'Entretien',
    tags: ['entretien', 'maintenance', 'conseils'],
    author: {
      name: 'Boss Vespa',
      role: 'Équipe Boss Vespa',
    },
  },
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter((post) => post.category === category)
}

