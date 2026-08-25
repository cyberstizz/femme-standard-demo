// Demo inventory. Replace with a Supabase query when the backend lands —
// keep the shape identical and nothing in the screens has to change.

export const CONDITIONS = ['Like new', 'Excellent', 'Very good', 'Good']
export const SIZES = ['XS', 'S', 'M', 'L', 'XL']
export const SILHOUETTES = [
  { id: 'dress', label: 'Dress' },
  { id: 'top', label: 'Top' },
  { id: 'pants', label: 'Trousers' },
  { id: 'skirt', label: 'Skirt' },
  { id: 'blazer', label: 'Jacket' },
  { id: 'bag', label: 'Bag' },
  { id: 'heel', label: 'Shoe' },
]

// Editable from Admin → Categories. Pieces reference these by id, so renaming a
// category never orphans the pieces filed under it.
export const CATEGORY_SEED = [
  { id: 'c-dresses', name: 'Dresses', silhouette: 'dress' },
  { id: 'c-tops', name: 'Tops', silhouette: 'top' },
  { id: 'c-bottoms', name: 'Bottoms', silhouette: 'pants' },
  { id: 'c-outerwear', name: 'Outerwear', silhouette: 'blazer' },
  { id: 'c-bags', name: 'Bags', silhouette: 'bag' },
  { id: 'c-shoes', name: 'Shoes', silhouette: 'heel' },
]

// Editable from Admin → Settings.
export const SETTINGS_SEED = {
  storeName: 'The Femme Standard',
  shipFrom: 'Miami',
  freeShippingOver: 150,
  taxRate: 0.07,
  holdMinutes: 15,
  storyEyebrow: 'The Standard',
  storyTitle: 'Pieces that still deserve their moment',
  quote:
    'I believe fashion should empower you to show up fully as yourself — without excess, without compromise.',
  quoteBy: 'Latavia · Founder',
  storyBody:
    "Every piece here is slightly worn, high quality, and one of one. Nothing is restocked. When it's gone, it's gone.\n\nEach one is measured flat and photographed as it is, marks and all. You should know exactly what's arriving before you buy it.",
}

const p = (id, title, categoryId, size, condition, price, sil, extra = {}) => ({
  id,
  title,
  categoryId,
  size,
  condition,
  price,
  silhouette: sil,
  status: 'live',
  photos: [],
  views: extra.views ?? 0,
  saves: extra.saves ?? 0,
  measurements: extra.measurements ?? null,
  fabric: extra.fabric ?? '',
  worn: extra.worn ?? 'Worn once',
  notes: extra.notes ?? '',
  ...extra,
})

export const SEED_PIECES = [
  p('fs-01', 'Black satin midi dress', 'c-dresses', 'M', 'Excellent', 68, 'dress', {
    views: 41, saves: 9, worn: 'Worn twice',
    measurements: { bust: '18 in', waist: '15 in', length: '48 in' },
    fabric: 'Satin · fully lined',
    notes: 'Bias cut, adjustable straps. No pulls or marks anywhere on the fabric.',
  }),
  p('fs-02', 'Structured leather tote', 'c-bags', 'One size', 'Like new', 145, 'bag', {
    views: 63, saves: 17, worn: 'Carried twice',
    measurements: { width: '14 in', height: '11 in', drop: '9 in' },
    fabric: 'Pebbled leather',
    notes: 'Interior is clean. Faint softening at the base corners, shown in the last photo.',
  }),
  p('fs-03', 'Gold strap heel', 'c-shoes', '8', 'Very good', 54, 'heel', {
    views: 28, saves: 6, worn: 'Worn three times',
    measurements: { heel: '3.5 in' },
    fabric: 'Metallic leather',
    notes: 'Light scuffing on the sole. Uppers are in good shape.',
  }),
  p('fs-04', 'Cream wide-leg trouser', 'c-bottoms', 'S', 'Excellent', 48, 'pants', {
    views: 22, saves: 4,
    measurements: { waist: '13 in', inseam: '30 in', rise: '11 in' },
    fabric: 'Crepe',
  }),
  p('fs-05', 'Black column gown', 'c-dresses', 'L', 'Like new', 132, 'dress', {
    views: 55, saves: 21, worn: 'Worn once',
    measurements: { bust: '20 in', waist: '17 in', length: '56 in' },
    fabric: 'Stretch jersey · lined',
    notes: 'Bought for one event. Hem is untouched.',
  }),
  p('fs-06', 'Ribbed knit shell', 'c-tops', 'M', 'Very good', 32, 'top', {
    views: 14, saves: 2,
    measurements: { bust: '17 in', length: '22 in' },
    fabric: 'Cotton rib',
  }),
  p('fs-07', 'Camel wrap coat', 'c-outerwear', 'M', 'Excellent', 118, 'blazer', {
    views: 47, saves: 15,
    measurements: { shoulder: '16 in', bust: '19 in', length: '44 in' },
    fabric: 'Wool blend',
  }),
  p('fs-08', 'Pleated midi skirt', 'c-bottoms', 'S', 'Like new', 44, 'skirt', {
    views: 19, saves: 5,
    measurements: { waist: '13 in', length: '31 in' },
    fabric: 'Poly satin',
  }),
  p('fs-09', 'Silk slip in champagne', 'c-dresses', 'S', 'Excellent', 76, 'dress', {
    views: 38, saves: 12,
    measurements: { bust: '16 in', waist: '15 in', length: '46 in' },
    fabric: 'Silk charmeuse',
  }),
  p('fs-10', 'Quilted shoulder bag', 'c-bags', 'One size', 'Very good', 88, 'bag', {
    views: 31, saves: 8,
    measurements: { width: '10 in', height: '7 in', drop: '11 in' },
    fabric: 'Lambskin',
    notes: 'Chain shows light wear. Clasp is tight.',
  }),
  p('fs-11', 'Ivory linen blazer', 'c-outerwear', 'S', 'Excellent', 92, 'blazer', {
    views: 26, saves: 7,
    measurements: { shoulder: '15 in', bust: '18 in', length: '27 in' },
    fabric: 'Linen',
  }),
  p('fs-12', 'Black leather pump', 'c-shoes', '7.5', 'Like new', 65, 'heel', {
    views: 20, saves: 5,
    measurements: { heel: '4 in' },
    fabric: 'Calf leather',
  }),
  p('fs-13', 'Off-shoulder crop top', 'c-tops', 'XS', 'Very good', 26, 'top', {
    views: 11, saves: 1,
    measurements: { bust: '15 in', length: '15 in' },
    fabric: 'Cotton poplin',
  }),
  p('fs-14', 'High-rise straight jean', 'c-bottoms', 'M', 'Good', 38, 'pants', {
    views: 24, saves: 6,
    measurements: { waist: '15 in', inseam: '31 in', rise: '12 in' },
    fabric: 'Rigid denim',
    notes: 'Honest wear at the back pocket edges. Priced for it.',
  }),
  p('fs-15', 'Sequin mini dress', 'c-dresses', 'M', 'Excellent', 84, 'dress', {
    views: 44, saves: 14,
    measurements: { bust: '17 in', waist: '14 in', length: '33 in' },
    fabric: 'Sequin on mesh',
  }),
  p('fs-16', 'Woven raffia clutch', 'c-bags', 'One size', 'Like new', 42, 'bag', {
    views: 16, saves: 3,
    measurements: { width: '11 in', height: '7 in' },
    fabric: 'Raffia',
  }),
  p('fs-17', 'Black wool trouser', 'c-bottoms', 'L', 'Excellent', 52, 'pants', {
    views: 13, saves: 2,
    measurements: { waist: '16 in', inseam: '30 in', rise: '12 in' },
    fabric: 'Tropical wool',
  }),
  p('fs-18', 'Satin blouse in bronze', 'c-tops', 'L', 'Very good', 34, 'top', {
    views: 9, saves: 1,
    measurements: { bust: '20 in', length: '25 in' },
    fabric: 'Satin',
  }),
  p('fs-19', 'Strappy gold sandal', 'c-shoes', '9', 'Excellent', 48, 'heel', {
    views: 21, saves: 4,
    measurements: { heel: '2.5 in' },
    fabric: 'Metallic leather',
  }),
  p('fs-20', 'Trench in stone', 'c-outerwear', 'L', 'Very good', 96, 'blazer', {
    views: 29, saves: 9,
    measurements: { shoulder: '17 in', bust: '21 in', length: '46 in' },
    fabric: 'Cotton gabardine',
  }),
  p('fs-21', 'Bodycon knit dress', 'c-dresses', 'XS', 'Like new', 58, 'dress', {
    views: 33, saves: 11,
    measurements: { bust: '15 in', waist: '13 in', length: '38 in' },
    fabric: 'Ponte knit',
  }),
  p('fs-22', 'Cropped denim jacket', 'c-outerwear', 'M', 'Good', 46, 'blazer', {
    views: 18, saves: 3,
    measurements: { shoulder: '16 in', bust: '19 in', length: '20 in' },
    fabric: 'Denim',
    notes: 'Softened wash from wear. No damage.',
  }),
  p('fs-23', 'Tiered maxi skirt', 'c-bottoms', 'M', 'Excellent', 56, 'skirt', {
    views: 15, saves: 4,
    measurements: { waist: '14 in', length: '40 in' },
    fabric: 'Georgette',
  }),

  // Already sold — kept visible so the shop shows movement
  { ...p('fs-s1', 'Red halter gown', 'c-dresses', 'S', 'Excellent', 110, 'dress'), status: 'sold', soldInDays: 2, views: 88, saves: 24 },
  { ...p('fs-s2', 'Black blazer dress', 'c-dresses', 'M', 'Like new', 74, 'dress'), status: 'sold', soldInDays: 1, views: 71, saves: 19 },
  { ...p('fs-s3', 'Croc-effect top handle', 'c-bags', 'One size', 'Excellent', 130, 'bag'), status: 'sold', soldInDays: 4, views: 64, saves: 16 },
  { ...p('fs-s4', 'Suede ankle boot', 'c-shoes', '8', 'Very good', 58, 'heel'), status: 'sold', soldInDays: 6, views: 40, saves: 8 },

  // Half-listed
  { ...p('fs-d1', 'Gold mesh top', 'c-tops', 'M', 'Excellent', 0, 'top'), status: 'draft' },
  { ...p('fs-d2', 'Printed wrap dress', 'c-dresses', 'L', 'Very good', 0, 'dress'), status: 'draft' },
]

export const SAVED_SEED = ['fs-02', 'fs-05', 'fs-15']