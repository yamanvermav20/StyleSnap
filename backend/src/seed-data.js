/**
 * Seed data for the StyleSnap API. Ids are fixed so previews/shots.json, tests and links can point at them.
 * Photos are from Unsplash (https://unsplash.com/license), served by images.unsplash.com.
 */

/** @param {string} id @param {number} [width] */
export const photo = (id, width = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`

// Product shots, reused by outfit items and the wardrobe photo library.
const P = {
  whiteTee: photo('1521572163474-6864f9cf17ab', 600),
  blueTee: photo('1564584217132-2271feaeb3c5', 600),
  blackTee: photo('1583743814966-8936f5b7be1a', 600),
  logoTee: photo('1618354691373-d851c5c3a990', 600),
  graphicTee: photo('1576566588028-4147f3842f27', 600),
  whiteSweatshirt: photo('1620799140408-edc6dcb6d633', 600),
  denimShirt: photo('1596755094514-f87e34085b2c', 600),
  whiteShirt: photo('1603252109303-2751441dd157', 600),
  chambrayShirt: photo('1558171813-4c088753af8f', 600),
  knitTop: photo('1434389677669-e08b4cac3105', 600),
  jeans: photo('1542272604-787c3835535d', 600),
  darkJeans: photo('1624378439575-d8705ad7ae80', 600),
  trousers: photo('1506629082955-511b1aa562c8', 600),
  joggers: photo('1594633312681-425c7b97ccd1', 600),
  denimDress: photo('1591369822096-ffd140ec948f', 600),
  redDress: photo('1572804013309-59a88b7e92f1', 600),
  floralDress: photo('1496747611176-843222e1e57c', 600),
  leatherJacket: photo('1551028719-00167b16eac5', 600),
  bomber: photo('1591047139829-d91aecb6caea', 600),
  denimJacket: photo('1611312449408-fcece27cdbb7', 600),
  greySneaker: photo('1460353581641-37baddab0fa2', 600),
  redRunner: photo('1542291026-7eec264c27ff', 600),
  tanSneaker: photo('1549298916-b41d501d3772', 600),
  orangeRunner: photo('1600185365483-26d7a4cc7519', 600),
  blackRunner: photo('1605348532760-6753d2c43329', 600),
  neonRunner: photo('1606107557195-0e29a4b5b4aa', 600),
  whiteSneaker: photo('1608231387042-66d1773070a5', 600),
  pastelSneaker: photo('1595950653106-6c9ebd614d3a', 600),
  floralHeels: photo('1543163521-1bf539c55dd2', 600),
  navyHeels: photo('1515347619252-60a4bf4fff4f', 600),
  brogues: photo('1614252235316-8c857d38b5f4', 600),
  sunglasses: photo('1511499767150-a48a237f0083', 600),
  watch: photo('1523275335684-37898b6baf30', 600),
  quiltedBag: photo('1548036328-c9fa89d128fa', 600),
  redBag: photo('1584917865442-de89df76afd3', 600),
  backpack: photo('1553062407-98eeb64c6a62', 600),
}

export const SEED_CATEGORIES = [
  { id: 'streetwear', name: 'Streetwear', description: 'Graphic layers, statement sneakers and city attitude.', imageUrl: photo('1520367445093-50dc08a59d9d', 600) },
  { id: 'minimal', name: 'Minimal', description: 'Clean lines, quiet colors and pieces that last.', imageUrl: photo('1571513722275-4b41940f54b8', 600) },
  { id: 'workwear', name: 'Workwear', description: 'Sharp tailoring for the office and beyond.', imageUrl: photo('1507679799987-c73779587ccf', 600) },
  { id: 'casual', name: 'Casual', description: 'Easy, everyday outfits that still look put together.', imageUrl: photo('1516826957135-700dedea698c', 600) },
  { id: 'summer', name: 'Summer', description: 'Light fabrics, bright prints and vacation energy.', imageUrl: photo('1502716119720-b23a93e5fe1b', 600) },
  { id: 'athleisure', name: 'Athleisure', description: 'Performance pieces you can wear all day.', imageUrl: photo('1515886657613-9f3515b0c78f', 600) },
  { id: 'evening', name: 'Evening', description: 'Gowns, sequins and looks made for a night out.', imageUrl: photo('1566174053879-31528523f8ae', 600) },
  { id: 'layering', name: 'Layering', description: 'Coats, trenches and textures for cooler days.', imageUrl: photo('1485462537746-965f33f7f6a7', 600) },
]

/** @param {string} name @param {string} brand @param {string} type @param {number} price @param {string} imageUrl */
const item = (name, brand, type, price, imageUrl) => ({ name, brand, type, price, imageUrl })

export const SEED_OUTFITS = [
  {
    id: 'outfit-01', title: 'Orange Wall Street Edit', categoryId: 'streetwear', creatorName: 'Malik Osei',
    description: 'A tailored blazer thrown over shorts and tall socks. Bright sneakers keep it playful.',
    imageUrl: photo('1520367445093-50dc08a59d9d'), gallery: [photo('1520975954732-35dd22299614'), photo('1529139574466-a303027c1d8b')],
    season: 'summer', occasion: 'everyday', tags: ['blazer', 'shorts', 'bold'], likes: 4821, daysAgo: 2,
    items: [item('Relaxed linen blazer', 'Northline', 'outerwear', 189, P.bomber), item('Graphic cotton tee', 'Field & Co', 'top', 42, P.graphicTee), item('Volt runner', 'Strada', 'shoes', 129, P.orangeRunner)],
  },
  {
    id: 'outfit-02', title: 'Rooftop Leather', categoryId: 'streetwear', creatorName: 'Leo Marchetti',
    description: 'All black from collar to boots. A cropped leather jacket gives it an edge.',
    imageUrl: photo('1520975954732-35dd22299614'), gallery: [P.leatherJacket],
    season: 'fall', occasion: 'party', tags: ['leather', 'monochrome', 'black'], likes: 3912, daysAgo: 5,
    items: [item('Cropped leather jacket', 'Atelier Nove', 'outerwear', 349, P.leatherJacket), item('Heavyweight black tee', 'Field & Co', 'top', 38, P.blackTee), item('Raw selvedge jeans', 'Indigo Lab', 'bottom', 148, P.darkJeans)],
  },
  {
    id: 'outfit-03', title: 'Red Logo Layers', categoryId: 'streetwear', creatorName: 'Ava Lindqvist',
    description: 'An oversized coat slung over a red logo tee. Round shades finish the look.',
    imageUrl: photo('1529139574466-a303027c1d8b'), gallery: [P.redRunner],
    season: 'fall', occasion: 'everyday', tags: ['logo', 'red', 'oversized'], likes: 2764, daysAgo: 9,
    items: [item('Boxy logo tee', 'Strada', 'top', 55, P.graphicTee), item('Crimson runner', 'Strada', 'shoes', 139, P.redRunner), item('Round metal sunglasses', 'Lumen', 'accessory', 95, P.sunglasses)],
  },
  {
    id: 'outfit-04', title: 'Denim Hoodie Mix', categoryId: 'streetwear', creatorName: 'Priya Nair',
    description: 'A grey hoodie under a classic trucker jacket. Comfortable enough for a long day out.',
    imageUrl: photo('1517841905240-472988babdf9'), gallery: [P.denimJacket],
    season: 'spring', occasion: 'travel', tags: ['denim', 'hoodie', 'comfort'], likes: 2210, daysAgo: 12,
    items: [item('Classic trucker jacket', 'Indigo Lab', 'outerwear', 128, P.denimJacket), item('Straight leg jeans', 'Indigo Lab', 'bottom', 98, P.jeans), item('Court sneaker', 'Strada', 'shoes', 85, P.whiteSneaker)],
  },
  {
    id: 'outfit-05', title: 'Ivory Blazer Set', categoryId: 'minimal', creatorName: 'Chloé Martin',
    description: 'A softly structured ivory blazer with a single red rose. Quietly confident.',
    imageUrl: photo('1571513722275-4b41940f54b8'), gallery: [P.whiteShirt],
    season: 'spring', occasion: 'work', tags: ['ivory', 'blazer', 'tailored'], likes: 3388, daysAgo: 3,
    items: [item('Poplin button-down', 'Northline', 'top', 79, P.whiteShirt), item('Wide leg trousers', 'Atelier Nove', 'bottom', 135, P.trousers), item('Satin pointed heels', 'Maison Rue', 'shoes', 165, P.navyHeels)],
  },
  {
    id: 'outfit-06', title: 'Black Sheer Study', categoryId: 'minimal', creatorName: 'Sofia Reyes',
    description: 'A sheer black blouse against a dark backdrop. Let the texture do the talking.',
    imageUrl: photo('1524504388940-b1c1722653e1'), gallery: [P.quiltedBag],
    season: 'allSeason', occasion: 'date', tags: ['black', 'sheer', 'evening'], likes: 2945, daysAgo: 7,
    items: [item('Sheer chiffon blouse', 'Maison Rue', 'top', 110, P.blackTee), item('Quilted shoulder bag', 'Atelier Nove', 'accessory', 420, P.quiltedBag), item('Minimal steel watch', 'Lumen', 'accessory', 210, P.watch)],
  },
  {
    id: 'outfit-07', title: 'Clean White Tee', categoryId: 'minimal', creatorName: 'Arjun Mehta',
    description: 'The perfect white tee, dark denim and nothing else. Minimal never goes out of style.',
    imageUrl: photo('1586790170083-2f9ceadc732d'), gallery: [P.whiteTee],
    season: 'summer', occasion: 'everyday', tags: ['white', 'basics', 'tee'], likes: 1876, daysAgo: 14,
    items: [item('Supima crew tee', 'Field & Co', 'top', 32, P.whiteTee), item('Raw selvedge jeans', 'Indigo Lab', 'bottom', 148, P.darkJeans), item('Court sneaker', 'Strada', 'shoes', 85, P.whiteSneaker)],
  },
  {
    id: 'outfit-08', title: 'Rose Wall Portrait', categoryId: 'minimal', creatorName: 'Noor Haddad',
    description: 'A messy bun, a fine gold chain and a soft neutral knit. Effortless styling for slow weekends.',
    imageUrl: photo('1531746020798-e6953c6e8e04'), gallery: [P.knitTop],
    season: 'fall', occasion: 'everyday', tags: ['knit', 'neutral', 'soft'], likes: 1540, daysAgo: 18,
    items: [item('Open knit poncho', 'Wool & Wren', 'top', 88, P.knitTop), item('Straight leg jeans', 'Indigo Lab', 'bottom', 98, P.jeans), item('Gold link watch', 'Lumen', 'accessory', 240, P.watch)],
  },
  {
    id: 'outfit-09', title: 'Classic Navy Suit', categoryId: 'workwear', creatorName: 'James Whitaker',
    description: 'A navy two-piece with a striped tie. Boardroom ready, every time.',
    imageUrl: photo('1507679799987-c73779587ccf'), gallery: [photo('1617137968427-85924c800a22')],
    season: 'allSeason', occasion: 'work', tags: ['suit', 'navy', 'tie'], likes: 3120, daysAgo: 4,
    items: [item('Poplin dress shirt', 'Northline', 'top', 79, P.whiteShirt), item('Leather oxford brogues', 'Hartley', 'shoes', 260, P.brogues), item('Minimal steel watch', 'Lumen', 'accessory', 210, P.watch)],
  },
  {
    id: 'outfit-10', title: 'Tailored Blue', categoryId: 'workwear', creatorName: 'Daniel Okafor',
    description: 'A cobalt blazer, crisp shirt and tan shoes. Smart without trying too hard.',
    imageUrl: photo('1617137968427-85924c800a22'), gallery: [P.chambrayShirt],
    season: 'spring', occasion: 'work', tags: ['blue', 'blazer', 'smart'], likes: 2488, daysAgo: 10,
    items: [item('Chambray shirt', 'Northline', 'top', 72, P.chambrayShirt), item('Leather oxford brogues', 'Hartley', 'shoes', 260, P.brogues), item('Canvas backpack', 'Field & Co', 'accessory', 95, P.backpack)],
  },
  {
    id: 'outfit-11', title: 'Waistcoat Wednesday', categoryId: 'workwear', creatorName: 'Tomás Rivera',
    description: 'A three-piece waistcoat with rolled sleeves. Old-school charm for the modern office.',
    imageUrl: photo('1504593811423-6dd665756598'), gallery: [],
    season: 'fall', occasion: 'work', tags: ['waistcoat', 'vintage', 'tailored'], likes: 1702, daysAgo: 21,
    items: [item('Poplin dress shirt', 'Northline', 'top', 79, P.whiteShirt), item('Leather oxford brogues', 'Hartley', 'shoes', 260, P.brogues), item('Tortoise sunglasses', 'Lumen', 'accessory', 95, P.sunglasses)],
  },
  {
    id: 'outfit-12', title: 'Plaid Coat Commute', categoryId: 'workwear', creatorName: 'Hannah Becker',
    description: 'A navy plaid coat over a dark knit. Warm, polished and ready for the train.',
    imageUrl: photo('1485968579580-b6d095142e6e'), gallery: [P.redBag],
    season: 'winter', occasion: 'work', tags: ['plaid', 'coat', 'commute'], likes: 2033, daysAgo: 16,
    items: [item('Merino crew knit', 'Wool & Wren', 'top', 120, P.blackTee), item('Raw selvedge jeans', 'Indigo Lab', 'bottom', 148, P.darkJeans), item('Structured top handle bag', 'Maison Rue', 'accessory', 310, P.redBag)],
  },
  {
    id: 'outfit-13', title: 'Pink Sweater Days', categoryId: 'casual', creatorName: 'Kai Tanaka',
    description: 'A blush sweatshirt with light ripped denim. Weekend comfort with a pop of color.',
    imageUrl: photo('1516826957135-700dedea698c'), gallery: [P.whiteSweatshirt],
    season: 'spring', occasion: 'everyday', tags: ['pink', 'sweatshirt', 'denim'], likes: 2655, daysAgo: 1,
    items: [item('Brushed fleece sweatshirt', 'Field & Co', 'top', 68, P.whiteSweatshirt), item('Straight leg jeans', 'Indigo Lab', 'bottom', 98, P.jeans), item('Court sneaker', 'Strada', 'shoes', 85, P.whiteSneaker)],
  },
  {
    id: 'outfit-14', title: 'Camel Leather Jacket', categoryId: 'casual', creatorName: 'Marco Bellini',
    description: 'A cognac leather jacket with slim jeans and suede boots. Effortless on a sunny afternoon.',
    imageUrl: photo('1617114919297-3c8ddb01f599'), gallery: [P.bomber],
    season: 'fall', occasion: 'date', tags: ['leather', 'camel', 'boots'], likes: 3301, daysAgo: 6,
    items: [item('Cognac bomber jacket', 'Atelier Nove', 'outerwear', 295, P.bomber), item('Heavyweight black tee', 'Field & Co', 'top', 38, P.blackTee), item('Straight leg jeans', 'Indigo Lab', 'bottom', 98, P.jeans)],
  },
  {
    id: 'outfit-15', title: 'Tangerine Knit', categoryId: 'casual', creatorName: 'Elena Petrova',
    description: 'A bright tangerine sweater tucked into high-rise jeans. Instant mood lift.',
    imageUrl: photo('1578587018452-892bacefd3f2'), gallery: [P.tanSneaker],
    season: 'fall', occasion: 'everyday', tags: ['orange', 'knit', 'color'], likes: 1988, daysAgo: 11,
    items: [item('Ribbed crew sweater', 'Wool & Wren', 'top', 94, P.knitTop), item('Straight leg jeans', 'Indigo Lab', 'bottom', 98, P.jeans), item('Suede court sneaker', 'Strada', 'shoes', 110, P.tanSneaker)],
  },
  {
    id: 'outfit-16', title: 'Band Tee Uniform', categoryId: 'casual', creatorName: 'Zoe Kim',
    description: 'A faded band tee, light denim and pastel sneakers. Laid back and a little rock and roll.',
    imageUrl: photo('1503342217505-b0a15ec3261c'), gallery: [P.pastelSneaker],
    season: 'summer', occasion: 'everyday', tags: ['graphic', 'denim', 'pastel'], likes: 1422, daysAgo: 19,
    items: [item('Vintage wash band tee', 'Strada', 'top', 45, P.graphicTee), item('Straight leg jeans', 'Indigo Lab', 'bottom', 98, P.jeans), item('Pastel court sneaker', 'Strada', 'shoes', 120, P.pastelSneaker)],
  },
  {
    id: 'outfit-17', title: 'Polka Dot Breeze', categoryId: 'summer', creatorName: 'Isabela Costa',
    description: 'A red polka dot wrap dress in the wind. Made for golden hour.',
    imageUrl: photo('1502716119720-b23a93e5fe1b'), gallery: [photo('1496747611176-843222e1e57c')],
    season: 'summer', occasion: 'travel', tags: ['polka dot', 'dress', 'red'], likes: 5210, daysAgo: 2,
    items: [item('Wrap midi dress', 'Maison Rue', 'dress', 145, P.redDress), item('Floral stiletto', 'Maison Rue', 'shoes', 180, P.floralHeels), item('Tortoise sunglasses', 'Lumen', 'accessory', 95, P.sunglasses)],
  },
  {
    id: 'outfit-18', title: 'Off-Shoulder Stripes', categoryId: 'summer', creatorName: 'Camila Duarte',
    description: 'A striped off-shoulder top and a straw hat. Seaside town, day one.',
    imageUrl: photo('1503185912284-5271ff81b9a8'), gallery: [P.sunglasses],
    season: 'summer', occasion: 'travel', tags: ['stripes', 'hat', 'beach'], likes: 3874, daysAgo: 8,
    items: [item('Striped off-shoulder top', 'Field & Co', 'top', 58, P.blueTee), item('Tortoise sunglasses', 'Lumen', 'accessory', 95, P.sunglasses), item('Pastel court sneaker', 'Strada', 'shoes', 120, P.pastelSneaker)],
  },
  {
    id: 'outfit-19', title: 'Riviera Knit Dress', categoryId: 'summer', creatorName: 'Giulia Romano',
    description: 'A fitted knit dress, wide brim hat and palm trees. Pure Riviera.',
    imageUrl: photo('1617922001439-4a2e6562f328'), gallery: [P.quiltedBag],
    season: 'summer', occasion: 'date', tags: ['knit', 'dress', 'hat'], likes: 2967, daysAgo: 13,
    items: [item('Ribbed knit midi dress', 'Wool & Wren', 'dress', 135, P.denimDress), item('Quilted shoulder bag', 'Atelier Nove', 'accessory', 420, P.quiltedBag), item('Floral stiletto', 'Maison Rue', 'shoes', 180, P.floralHeels)],
  },
  {
    id: 'outfit-20', title: 'White Linen Weekend', categoryId: 'summer', creatorName: 'Freya Olsen',
    description: 'A white tiered skirt and off-shoulder top. Fresh, light and ready for the sun.',
    imageUrl: photo('1515372039744-b8f02a3ae446'), gallery: [P.whiteSneaker],
    season: 'summer', occasion: 'everyday', tags: ['white', 'linen', 'tiered'], likes: 2340, daysAgo: 15,
    items: [item('Tiered linen set', 'Field & Co', 'dress', 120, P.floralDress), item('Court sneaker', 'Strada', 'shoes', 85, P.whiteSneaker), item('Canvas backpack', 'Field & Co', 'accessory', 95, P.backpack)],
  },
  {
    id: 'outfit-21', title: 'Golden Tracksuit', categoryId: 'athleisure', creatorName: 'Nia Johnson',
    description: 'A mustard yellow tracksuit with a cropped hoodie. Loud in the best way.',
    imageUrl: photo('1515886657613-9f3515b0c78f'), gallery: [P.orangeRunner],
    season: 'spring', occasion: 'sport', tags: ['tracksuit', 'yellow', 'sporty'], likes: 3602, daysAgo: 3,
    items: [item('Cropped fleece hoodie', 'Pace', 'top', 75, P.whiteSweatshirt), item('Tapered track pants', 'Pace', 'bottom', 70, P.joggers), item('Volt runner', 'Strada', 'shoes', 129, P.orangeRunner)],
  },
  {
    id: 'outfit-22', title: 'Studio Session', categoryId: 'athleisure', creatorName: 'Maya Brooks',
    description: 'Matching sets for a high-energy dance class. Breathable and built to move.',
    imageUrl: photo('1518310383802-640c2de311b2'), gallery: [P.neonRunner],
    season: 'allSeason', occasion: 'sport', tags: ['dance', 'sets', 'training'], likes: 1876, daysAgo: 17,
    items: [item('Seamless sports bra', 'Pace', 'top', 48, P.blackTee), item('High-rise leggings', 'Pace', 'bottom', 78, P.joggers), item('Neon trainer', 'Strada', 'shoes', 140, P.neonRunner)],
  },
  {
    id: 'outfit-23', title: 'Early Run', categoryId: 'athleisure', creatorName: 'Ethan Clarke',
    description: 'A sleeveless top and bright runners for the first miles of the day.',
    imageUrl: photo('1483721310020-03333e577078'), gallery: [P.redRunner],
    season: 'allSeason', occasion: 'sport', tags: ['running', 'training', 'morning'], likes: 1290, daysAgo: 22,
    items: [item('Dry-fit tank', 'Pace', 'top', 35, P.blackTee), item('Crimson runner', 'Strada', 'shoes', 139, P.redRunner), item('Minimal steel watch', 'Lumen', 'accessory', 210, P.watch)],
  },
  {
    id: 'outfit-24', title: 'Plum Off-Shoulder', categoryId: 'evening', creatorName: 'Amara Diallo',
    description: 'A plum off-shoulder gown with statement earrings. Elegant from every angle.',
    imageUrl: photo('1566174053879-31528523f8ae'), gallery: [P.navyHeels],
    season: 'allSeason', occasion: 'party', tags: ['gown', 'plum', 'elegant'], likes: 4410, daysAgo: 4,
    items: [item('Off-shoulder velvet gown', 'Maison Rue', 'dress', 380, P.redDress), item('Satin pointed heels', 'Maison Rue', 'shoes', 165, P.navyHeels), item('Quilted shoulder bag', 'Atelier Nove', 'accessory', 420, P.quiltedBag)],
  },
  {
    id: 'outfit-25', title: 'Scarlet Gown', categoryId: 'evening', creatorName: 'Valentina Cruz',
    description: 'A flowing scarlet gown that moves with you. A guaranteed entrance.',
    imageUrl: photo('1595777457583-95e059d581b8'), gallery: [photo('1612336307429-8a898d10e223')],
    season: 'summer', occasion: 'party', tags: ['gown', 'red', 'flowing'], likes: 5022, daysAgo: 6,
    items: [item('Chiffon maxi gown', 'Maison Rue', 'dress', 420, P.redDress), item('Floral stiletto', 'Maison Rue', 'shoes', 180, P.floralHeels), item('Structured top handle bag', 'Maison Rue', 'accessory', 310, P.redBag)],
  },
  {
    id: 'outfit-26', title: 'Sequin Night Out', categoryId: 'evening', creatorName: 'Lena & Mia',
    description: 'Ruby sequins and ruffles. Twin looks for a night of dancing.',
    imageUrl: photo('1550614000-4895a10e1bfd'), gallery: [P.floralHeels],
    season: 'allSeason', occasion: 'party', tags: ['sequins', 'red', 'party'], likes: 2876, daysAgo: 20,
    items: [item('Sequin mini dress', 'Maison Rue', 'dress', 260, P.redDress), item('Floral stiletto', 'Maison Rue', 'shoes', 180, P.floralHeels), item('Quilted shoulder bag', 'Atelier Nove', 'accessory', 420, P.quiltedBag)],
  },
  {
    id: 'outfit-27', title: 'Blush Coat Arcade', categoryId: 'layering', creatorName: 'Clara Weiss',
    description: 'A blush wool coat over black tights under old stone arches.',
    imageUrl: photo('1485462537746-965f33f7f6a7'), gallery: [photo('1539109136881-3be0616acf4b')],
    season: 'winter', occasion: 'everyday', tags: ['coat', 'pink', 'wool'], likes: 3550, daysAgo: 5,
    items: [item('Double-faced wool coat', 'Wool & Wren', 'outerwear', 420, P.bomber), item('Satin pointed heels', 'Maison Rue', 'shoes', 165, P.navyHeels), item('Structured top handle bag', 'Maison Rue', 'accessory', 310, P.redBag)],
  },
  {
    id: 'outfit-28', title: 'Camel Trench', categoryId: 'layering', creatorName: 'Olivia Hart',
    description: 'A belted camel trench on stone steps. The definitive transitional layer.',
    imageUrl: photo('1539533018447-63fcce2678e3'), gallery: [P.quiltedBag],
    season: 'fall', occasion: 'work', tags: ['trench', 'camel', 'classic'], likes: 4102, daysAgo: 8,
    items: [item('Belted cotton trench', 'Northline', 'outerwear', 289, P.bomber), item('Raw selvedge jeans', 'Indigo Lab', 'bottom', 148, P.darkJeans), item('Quilted shoulder bag', 'Atelier Nove', 'accessory', 420, P.quiltedBag)],
  },
  {
    id: 'outfit-29', title: 'Utility Jacket Layers', categoryId: 'layering', creatorName: 'Rosa Jiménez',
    description: 'An olive utility jacket, beanie and long white tee. Built for wandering.',
    imageUrl: photo('1544022613-e87ca75a784a'), gallery: [P.denimJacket],
    season: 'fall', occasion: 'travel', tags: ['utility', 'olive', 'beanie'], likes: 2299, daysAgo: 12,
    items: [item('Classic trucker jacket', 'Indigo Lab', 'outerwear', 128, P.denimJacket), item('Straight leg jeans', 'Indigo Lab', 'bottom', 98, P.jeans), item('Suede court sneaker', 'Strada', 'shoes', 110, P.tanSneaker)],
  },
  {
    id: 'outfit-30', title: 'Burgundy Coat & Shades', categoryId: 'layering', creatorName: 'Yara Haddad',
    description: 'A burgundy coat, cat-eye sunglasses and shopping bags in hand.',
    imageUrl: photo('1483985988355-763728e1935b'), gallery: [P.redBag],
    season: 'winter', occasion: 'date', tags: ['burgundy', 'coat', 'shopping'], likes: 3180, daysAgo: 9,
    items: [item('Wool wrap coat', 'Wool & Wren', 'outerwear', 360, P.bomber), item('Tortoise sunglasses', 'Lumen', 'accessory', 95, P.sunglasses), item('Structured top handle bag', 'Maison Rue', 'accessory', 310, P.redBag)],
  },
]

export const SEED_COLLECTIONS = [
  { id: 'collection-weekend', name: 'Weekend edits', description: 'Easy looks for slow Saturdays.', outfitIds: ['outfit-13', 'outfit-17', 'outfit-04', 'outfit-15'], daysAgo: 1 },
  { id: 'collection-office', name: 'Office ready', description: 'Polished outfits for the work week.', outfitIds: ['outfit-05', 'outfit-28', 'outfit-09'], daysAgo: 3 },
  { id: 'collection-night-out', name: 'Night out', description: '', outfitIds: ['outfit-25', 'outfit-24', 'outfit-02'], daysAgo: 6 },
]

export const SEED_WARDROBE = [
  { id: 'wardrobe-01', name: 'White crew tee', brand: 'Field & Co', type: 'top', color: 'White', season: 'allSeason', imageUrl: P.whiteTee, notes: 'Goes with everything. Size M.', favorite: true, daysAgo: 1 },
  { id: 'wardrobe-02', name: 'Raw selvedge jeans', brand: 'Indigo Lab', type: 'bottom', color: 'Indigo', season: 'allSeason', imageUrl: P.darkJeans, notes: 'Wash inside out, cold.', favorite: true, daysAgo: 2 },
  { id: 'wardrobe-03', name: 'Black leather jacket', brand: 'Atelier Nove', type: 'outerwear', color: 'Black', season: 'fall', imageUrl: P.leatherJacket, notes: '', favorite: true, daysAgo: 3 },
  { id: 'wardrobe-04', name: 'White court sneakers', brand: 'Strada', type: 'shoes', color: 'White', season: 'allSeason', imageUrl: P.whiteSneaker, notes: 'Clean with a soft brush.', favorite: false, daysAgo: 4 },
  { id: 'wardrobe-05', name: 'Trucker denim jacket', brand: 'Indigo Lab', type: 'outerwear', color: 'Mid blue', season: 'spring', imageUrl: P.denimJacket, notes: '', favorite: false, daysAgo: 5 },
  { id: 'wardrobe-06', name: 'Tortoise sunglasses', brand: 'Lumen', type: 'accessory', color: 'Tortoise', season: 'summer', imageUrl: P.sunglasses, notes: '', favorite: false, daysAgo: 6 },
  { id: 'wardrobe-07', name: 'Red top handle bag', brand: 'Maison Rue', type: 'accessory', color: 'Red', season: 'allSeason', imageUrl: P.redBag, notes: 'Dust bag in the closet.', favorite: true, daysAgo: 7 },
  { id: 'wardrobe-08', name: 'Denim shirt dress', brand: 'Field & Co', type: 'dress', color: 'Light blue', season: 'summer', imageUrl: P.denimDress, notes: '', favorite: false, daysAgo: 8 },
  { id: 'wardrobe-09', name: 'Chambray shirt', brand: 'Northline', type: 'top', color: 'Sky blue', season: 'spring', imageUrl: P.chambrayShirt, notes: 'Iron on low.', favorite: false, daysAgo: 9 },
  { id: 'wardrobe-10', name: 'Leather brogues', brand: 'Hartley', type: 'shoes', color: 'Cognac', season: 'fall', imageUrl: P.brogues, notes: 'Polish monthly.', favorite: false, daysAgo: 10 },
]

/** The wardrobe editor's photo library, grouped by type in display order. */
export const WARDROBE_PHOTOS = [
  ['top', ['whiteTee', 'blueTee', 'blackTee', 'logoTee', 'graphicTee', 'whiteSweatshirt', 'denimShirt', 'whiteShirt', 'chambrayShirt', 'knitTop']],
  ['bottom', ['jeans', 'darkJeans', 'trousers', 'joggers']],
  ['dress', ['denimDress', 'redDress', 'floralDress']],
  ['outerwear', ['leatherJacket', 'bomber', 'denimJacket']],
  ['shoes', ['whiteSneaker', 'greySneaker', 'redRunner', 'tanSneaker', 'orangeRunner', 'blackRunner', 'neonRunner', 'pastelSneaker', 'floralHeels', 'navyHeels', 'brogues']],
  ['accessory', ['sunglasses', 'watch', 'quiltedBag', 'redBag', 'backpack']],
].flatMap(([type, keys]) => /** @type {string[]} */ (keys).map((key) => ({ id: `photo-${key}`, type: /** @type {string} */ (type), imageUrl: P[/** @type {keyof typeof P} */ (key)] })))
