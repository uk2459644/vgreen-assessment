// Sample catalogue (made-up data for the assignment).
// Images are deterministic placeholders from picsum.photos. Swap the URLs for
// real product photos (e.g. files in web/public/products) when you have them.
const img = (seed) => `https://picsum.photos/seed/${seed}/800/800`;

const ALL_CUSTOM = ['Logo printing', 'Laser engraving', 'Name personalisation'];

module.exports = [
  // ---------- Drinkware ----------
  {
    name: 'Insulated Steel Bottle',
    image: img('tg-steel-bottle'),
    category: 'Drinkware',
    description: 'Double-wall 500 ml bottle that keeps drinks hot for 12 hours and cold for 24.',
    priceMin: 450,
    priceMax: 700,
    occasions: ['Employee Onboarding', 'Events and Trade Shows', 'New Year Gifts'],
    customisations: ['Logo printing', 'Laser engraving', 'Name personalisation'],
  },
  {
    name: 'Ceramic Coffee Mug Set',
    image: img('tg-mug-set'),
    category: 'Drinkware',
    description: 'Set of two matte ceramic mugs in a gift box, dishwasher safe.',
    priceMin: 350,
    priceMax: 600,
    occasions: ['Employee Onboarding', 'Employee Recognition', 'Client and Vendor Gifting'],
    customisations: ['Logo printing', 'Name personalisation'],
  },
  {
    name: 'Pure Copper Bottle',
    image: img('tg-copper-bottle'),
    category: 'Drinkware',
    description: 'Hammered-finish 900 ml copper bottle, a festive favourite for Diwali hampers.',
    priceMin: 800,
    priceMax: 1200,
    occasions: ['Corporate Diwali Gifting', 'Client and Vendor Gifting', 'New Year Gifts'],
    customisations: ['Laser engraving', 'Name personalisation'],
  },

  // ---------- Apparel ----------
  {
    name: 'Classic Cotton Polo T-shirt',
    image: img('tg-polo-tee'),
    category: 'Apparel',
    description: 'Breathable 220 GSM pique cotton polo with embroidered chest logo.',
    priceMin: 400,
    priceMax: 700,
    occasions: ['Employee Onboarding', 'Events and Trade Shows'],
    customisations: ['Logo printing', 'Name personalisation'],
  },
  {
    name: 'Premium Fleece Hoodie',
    image: img('tg-fleece-hoodie'),
    category: 'Apparel',
    description: 'Soft brushed-fleece hoodie, ideal for winter welcome kits and team wear.',
    priceMin: 1200,
    priceMax: 1800,
    occasions: ['Employee Onboarding', 'Employee Recognition', 'New Year Gifts'],
    customisations: ['Logo printing', 'Name personalisation'],
  },
  {
    name: 'Branded Baseball Cap',
    image: img('tg-baseball-cap'),
    category: 'Apparel',
    description: 'Adjustable cotton twill cap with a front-embroidered logo.',
    priceMin: 250,
    priceMax: 400,
    occasions: ['Events and Trade Shows', 'Employee Onboarding'],
    customisations: ['Logo printing'],
  },

  // ---------- Work Essentials ----------
  {
    name: 'Leather Diary and Pen Set',
    image: img('tg-diary-pen'),
    category: 'Work Essentials',
    description: 'A5 faux-leather diary with a metal pen, presented in a magnetic box.',
    priceMin: 600,
    priceMax: 1100,
    occasions: ['Corporate Diwali Gifting', 'New Year Gifts', 'Client and Vendor Gifting'],
    customisations: ALL_CUSTOM,
  },
  {
    name: 'Anti-theft Laptop Backpack',
    image: img('tg-laptop-backpack'),
    category: 'Work Essentials',
    description: 'Water-resistant 25 L backpack with a padded 15.6 inch laptop sleeve and USB port.',
    priceMin: 1400,
    priceMax: 2200,
    occasions: ['Employee Onboarding', 'Employee Recognition'],
    customisations: ['Logo printing', 'Name personalisation'],
  },
  {
    name: 'Wooden Desk Organiser',
    image: img('tg-desk-organiser'),
    category: 'Work Essentials',
    description: 'Sheesham wood organiser with phone stand, pen slots and card tray.',
    priceMin: 500,
    priceMax: 900,
    occasions: ['Employee Onboarding', 'Client and Vendor Gifting', 'Employee Recognition'],
    customisations: ['Laser engraving', 'Logo printing'],
  },
  {
    name: '10000 mAh Power Bank',
    image: img('tg-power-bank'),
    category: 'Work Essentials',
    description: 'Slim fast-charging power bank with dual output and a premium matte finish.',
    priceMin: 900,
    priceMax: 1600,
    occasions: ['Events and Trade Shows', 'Employee Recognition', 'Client and Vendor Gifting'],
    customisations: ['Logo printing', 'Laser engraving'],
  },
  {
    name: 'Executive Welcome Kit',
    image: img('tg-welcome-kit'),
    category: 'Work Essentials',
    description:
      'Five-piece kit: steel bottle, diary, pen, power bank and card holder in a rigid gift box.',
    priceMin: 3500,
    priceMax: 5500,
    occasions: ['Employee Onboarding', 'Client and Vendor Gifting'],
    customisations: ALL_CUSTOM,
  },

  // ---------- Wellness ----------
  {
    name: 'Eco Yoga Mat',
    image: img('tg-yoga-mat'),
    category: 'Wellness',
    description: '6 mm non-slip TPE mat with carry strap, available in five colours.',
    priceMin: 700,
    priceMax: 1200,
    occasions: ['Employee Recognition', 'New Year Gifts', 'Events and Trade Shows'],
    customisations: ['Logo printing'],
  },
  {
    name: 'Herbal Tea Gift Box',
    image: img('tg-tea-box'),
    category: 'Wellness',
    description: 'Six handpicked herbal and green tea blends in a reusable wooden box.',
    priceMin: 600,
    priceMax: 1200,
    occasions: ['Corporate Diwali Gifting', 'New Year Gifts', 'Client and Vendor Gifting'],
    customisations: ['Logo printing', 'Laser engraving'],
  },
  {
    name: 'Aroma Candle Trio',
    image: img('tg-aroma-candles'),
    category: 'Wellness',
    description: 'Three soy-wax scented candles in glass jars, with a custom sleeve.',
    priceMin: 800,
    priceMax: 1500,
    occasions: ['Corporate Diwali Gifting', 'Client and Vendor Gifting'],
    customisations: ['Logo printing', 'Name personalisation'],
  },
  {
    name: 'Premium Wellness Hamper',
    image: img('tg-wellness-hamper'),
    category: 'Wellness',
    description:
      'Curated hamper with herbal teas, dry fruits, a scented candle and a copper bottle.',
    priceMin: 3200,
    priceMax: 4500,
    occasions: ['Corporate Diwali Gifting', 'Client and Vendor Gifting', 'New Year Gifts'],
    customisations: ALL_CUSTOM,
  },
];
