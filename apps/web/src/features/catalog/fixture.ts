import type { Category, Outfit, OutfitCollection, OutfitItem, WardrobeItem, WardrobePhoto } from '#/generated/api'
import type { ItemType, Occasion, Season } from '#/core/labels'

/** Unsplash crop URL, matching backend/src/seed-data.js. */
const photo = (id: string, width = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`

const whiteTee = photo('1521572163474-6864f9cf17ab', 600)
const blueTee = photo('1564584217132-2271feaeb3c5', 600)
const blackTee = photo('1583743814966-8936f5b7be1a', 600)
const logoTee = photo('1618354691373-d851c5c3a990', 600)
const graphicTee = photo('1576566588028-4147f3842f27', 600)
const whiteSweatshirt = photo('1620799140408-edc6dcb6d633', 600)
const denimShirt = photo('1596755094514-f87e34085b2c', 600)
const whiteShirt = photo('1603252109303-2751441dd157', 600)
const chambrayShirt = photo('1558171813-4c088753af8f', 600)
const knitTop = photo('1434389677669-e08b4cac3105', 600)
const darkJeans = photo('1624378439575-d8705ad7ae80', 600)
const trousers = photo('1506629082955-511b1aa562c8', 600)
const bomber = photo('1591047139829-d91aecb6caea', 600)
const orangeRunner = photo('1600185365483-26d7a4cc7519', 600)
const navyHeels = photo('1515347619252-60a4bf4fff4f', 600)
const whiteSneaker = photo('1608231387042-66d1773070a5', 600)
const greySneaker = photo('1460353581641-37baddab0fa2', 600)
const redRunner = photo('1542291026-7eec264c27ff', 600)
const tanSneaker = photo('1549298916-b41d501d3772', 600)
const blackRunner = photo('1605348532760-6753d2c43329', 600)
const neonRunner = photo('1606107557195-0e29a4b5b4aa', 600)
const pastelSneaker = photo('1595950653106-6c9ebd614d3a', 600)
const floralHeels = photo('1543163521-1bf539c55dd2', 600)
const brogues = photo('1614252235316-8c857d38b5f4', 600)

const EPOCH = Date.parse('2020-06-01T00:00:00.000Z')
const daysAgo = (days: number) => new Date(EPOCH - days * 24 * 60 * 60 * 1000).toISOString()

const item = (name: string, brand: string, type: ItemType, price: number, imageUrl: string): OutfitItem => ({
  name,
  brand,
  type,
  price,
  imageUrl,
})

const outfit = ({
  days,
  ...fields
}: Omit<Outfit, 'createdAt'> & { days: number }): Outfit => ({
  ...fields,
  createdAt: daysAgo(days),
})

/** Categories streetwear and minimal, in API order. */
export function fixtureCategories(): Category[] {
  return [
    {
      id: 'streetwear',
      name: 'Streetwear',
      description: 'Graphic layers, statement sneakers and city attitude.',
      imageUrl: photo('1520367445093-50dc08a59d9d', 600),
      outfitCount: 1,
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean lines, quiet colors and pieces that last.',
      imageUrl: photo('1571513722275-4b41940f54b8', 600),
      outfitCount: 2,
    },
  ]
}

/** Outfits outfit-01, outfit-05 and outfit-07. */
export function fixtureOutfits(): Outfit[] {
  return [
    outfit({
      id: 'outfit-01',
      title: 'Orange Wall Street Edit',
      categoryId: 'streetwear',
      categoryName: 'Streetwear',
      creatorName: 'Malik Osei',
      description: 'A tailored blazer thrown over shorts and tall socks. Bright sneakers keep it playful.',
      imageUrl: photo('1520367445093-50dc08a59d9d'),
      gallery: [photo('1520975954732-35dd22299614'), photo('1529139574466-a303027c1d8b')],
      season: 'summer' satisfies Season,
      occasion: 'everyday' satisfies Occasion,
      tags: ['blazer', 'shorts', 'bold'],
      likes: 4821,
      days: 2,
      items: [
        item('Relaxed linen blazer', 'Northline', 'outerwear', 189, bomber),
        item('Graphic cotton tee', 'Field & Co', 'top', 42, graphicTee),
        item('Volt runner', 'Strada', 'shoes', 129, orangeRunner),
      ],
    }),
    outfit({
      id: 'outfit-05',
      title: 'Ivory Blazer Set',
      categoryId: 'minimal',
      categoryName: 'Minimal',
      creatorName: 'Chloé Martin',
      description: 'A softly structured ivory blazer with a single red rose. Quietly confident.',
      imageUrl: photo('1571513722275-4b41940f54b8'),
      gallery: [whiteShirt],
      season: 'spring',
      occasion: 'work',
      tags: ['ivory', 'blazer', 'tailored'],
      likes: 3388,
      days: 3,
      items: [
        item('Poplin button-down', 'Northline', 'top', 79, whiteShirt),
        item('Wide leg trousers', 'Atelier Nove', 'bottom', 135, trousers),
        item('Satin pointed heels', 'Maison Rue', 'shoes', 165, navyHeels),
      ],
    }),
    outfit({
      id: 'outfit-07',
      title: 'Clean White Tee',
      categoryId: 'minimal',
      categoryName: 'Minimal',
      creatorName: 'Arjun Mehta',
      description: 'The perfect white tee, dark denim and nothing else. Minimal never goes out of style.',
      imageUrl: photo('1586790170083-2f9ceadc732d'),
      gallery: [whiteTee],
      season: 'summer',
      occasion: 'everyday',
      tags: ['white', 'basics', 'tee'],
      likes: 1876,
      days: 14,
      items: [
        item('Supima crew tee', 'Field & Co', 'top', 32, whiteTee),
        item('Raw selvedge jeans', 'Indigo Lab', 'bottom', 148, darkJeans),
        item('Court sneaker', 'Strada', 'shoes', 85, whiteSneaker),
      ],
    }),
  ]
}

/** collection-weekend, containing outfit-01. */
export function fixtureCollections(outfits: Outfit[] = fixtureOutfits()): OutfitCollection[] {
  const cover = outfits.find((entry) => entry.id === 'outfit-01')?.imageUrl ?? ''
  const timestamp = daysAgo(1)
  return [
    {
      id: 'collection-weekend',
      name: 'Weekend edits',
      description: 'Easy looks for slow Saturdays.',
      outfitIds: ['outfit-01'],
      coverImageUrls: cover ? [cover] : [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]
}

/** wardrobe-01 and wardrobe-04. */
export function fixtureWardrobe(): WardrobeItem[] {
  return [
    {
      id: 'wardrobe-01',
      name: 'White crew tee',
      brand: 'Field & Co',
      type: 'top',
      color: 'White',
      season: 'allSeason',
      imageUrl: whiteTee,
      notes: 'Goes with everything. Size M.',
      favorite: true,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: 'wardrobe-04',
      name: 'White court sneakers',
      brand: 'Strada',
      type: 'shoes',
      color: 'White',
      season: 'allSeason',
      imageUrl: whiteSneaker,
      notes: 'Clean with a soft brush.',
      favorite: false,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
    },
  ]
}

const library: { type: ItemType; photos: { key: string; imageUrl: string }[] }[] = [
  {
    type: 'top',
    photos: [
      { key: 'whiteTee', imageUrl: whiteTee },
      { key: 'blueTee', imageUrl: blueTee },
      { key: 'blackTee', imageUrl: blackTee },
      { key: 'logoTee', imageUrl: logoTee },
      { key: 'graphicTee', imageUrl: graphicTee },
      { key: 'whiteSweatshirt', imageUrl: whiteSweatshirt },
      { key: 'denimShirt', imageUrl: denimShirt },
      { key: 'whiteShirt', imageUrl: whiteShirt },
      { key: 'chambrayShirt', imageUrl: chambrayShirt },
      { key: 'knitTop', imageUrl: knitTop },
    ],
  },
  {
    type: 'shoes',
    photos: [
      { key: 'whiteSneaker', imageUrl: whiteSneaker },
      { key: 'greySneaker', imageUrl: greySneaker },
      { key: 'redRunner', imageUrl: redRunner },
      { key: 'tanSneaker', imageUrl: tanSneaker },
      { key: 'orangeRunner', imageUrl: orangeRunner },
      { key: 'blackRunner', imageUrl: blackRunner },
      { key: 'neonRunner', imageUrl: neonRunner },
      { key: 'pastelSneaker', imageUrl: pastelSneaker },
      { key: 'floralHeels', imageUrl: floralHeels },
      { key: 'navyHeels', imageUrl: navyHeels },
      { key: 'brogues', imageUrl: brogues },
    ],
  },
]

/** Photo library tops and shoes, in seed order. */
export function fixturePhotos(): WardrobePhoto[] {
  return library.flatMap((group) => group.photos.map((entry) => ({ id: `photo-${entry.key}`, type: group.type, imageUrl: entry.imageUrl })))
}
