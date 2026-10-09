import hero from "@/assets/hero.jpg";
import chicken from "@/assets/chicken.jpg";
import burger from "@/assets/burger.jpg";
import combo from "@/assets/combo.jpg";
import chips from "@/assets/chips.jpg";
import drinks from "@/assets/drinks.jpg";
import extras from "@/assets/extras.jpg";

export const BUSINESS = {
  name: "Aya's Delicious Fish & Chips",
  founder: "Ayabonga Jonas",
  tagline: "Fresh. Crispy. Local.",
  address: "Cape Town CBD, Cape Town",
  phone: "073 522 7408",
  whatsapp: "27735227408",
  hours: [
    { day: "Monday – Friday", time: "09:00 – 21:00" },
    { day: "Saturday", time: "09:00 – 22:00" },
    { day: "Sunday", time: "10:00 – 20:00" },
  ],
  deliveryFee: 25,
};

export const CATEGORIES = ["Fish", "Chips", "Chicken", "Burgers", "Combos", "Extras", "Drinks"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_IMAGES: Record<Category, string> = {
  Fish: hero,
  Chips: chips,
  Chicken: chicken,
  Burgers: burger,
  Combos: combo,
  Extras: extras,
  Drinks: drinks,
};

export type MenuItem = {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  image: string;
  popular?: boolean;
  prepMinutes: number;
  customisable?: boolean;
};

export const MENU: MenuItem[] = [
  { id: "hake-chips", name: "Hake & Chips", category: "Fish", price: 65, description: "Flaky battered hake, golden chips, lemon.", image: hero, popular: true, prepMinutes: 12, customisable: true },
  { id: "large-hake", name: "Large Hake & Chips", category: "Fish", price: 85, description: "Double portion of hake with large chips.", image: hero, prepMinutes: 14, customisable: true },
  { id: "fish-only", name: "Fish Only", category: "Fish", price: 45, description: "One crispy hake fillet.", image: hero, prepMinutes: 10, customisable: true },
  { id: "small-chips", name: "Small Chips", category: "Chips", price: 20, description: "Hand-cut, salted.", image: chips, prepMinutes: 6, customisable: true },
  { id: "medium-chips", name: "Medium Chips", category: "Chips", price: 30, description: "Hand-cut, salted.", image: chips, prepMinutes: 7, customisable: true },
  { id: "large-chips", name: "Large Chips", category: "Chips", price: 40, description: "Share-size hand-cut chips.", image: chips, popular: true, prepMinutes: 8, customisable: true },
  { id: "chicken-chips", name: "Chicken & Chips", category: "Chicken", price: 55, description: "Buttermilk fried chicken with chips.", image: chicken, popular: true, prepMinutes: 14, customisable: true },
  { id: "wings", name: "Chicken Wings (6)", category: "Chicken", price: 60, description: "Crispy wings, choice of sauce.", image: chicken, prepMinutes: 15, customisable: true },
  { id: "strips", name: "Chicken Strips", category: "Chicken", price: 50, description: "Tender strips with dip.", image: chicken, prepMinutes: 12, customisable: true },
  { id: "fish-burger", name: "Fish Burger", category: "Burgers", price: 55, description: "Battered hake, slaw, tartare.", image: burger, prepMinutes: 12, customisable: true },
  { id: "chicken-burger", name: "Chicken Burger", category: "Burgers", price: 55, description: "Crispy chicken fillet, lettuce, mayo.", image: burger, prepMinutes: 12, customisable: true },
  { id: "beef-burger", name: "Beef Burger", category: "Burgers", price: 60, description: "Beef patty, cheese, onion, tomato.", image: burger, popular: true, prepMinutes: 13, customisable: true },
  { id: "fish-combo", name: "Fish Combo", category: "Combos", price: 80, description: "Hake, chips and a cold drink.", image: combo, prepMinutes: 13, customisable: true },
  { id: "chicken-combo", name: "Chicken Combo", category: "Combos", price: 75, description: "Chicken, chips and a cold drink.", image: combo, prepMinutes: 14, customisable: true },
  { id: "family-combo", name: "Family Combo", category: "Combos", price: 230, description: "2 fish, 2 chicken, 2 large chips, coleslaw, 2L drink.", image: combo, popular: true, prepMinutes: 20, customisable: true },
  { id: "russian", name: "Russian", category: "Extras", price: 18, description: "Grilled russian sausage.", image: extras, prepMinutes: 5 },
  { id: "cheese", name: "Cheese", category: "Extras", price: 8, description: "Melted cheese topping.", image: extras, prepMinutes: 1 },
  { id: "egg", name: "Egg", category: "Extras", price: 7, description: "Fried egg.", image: extras, prepMinutes: 3 },
  { id: "coleslaw", name: "Coleslaw", category: "Extras", price: 15, description: "Creamy house slaw.", image: extras, prepMinutes: 1 },
  { id: "coke", name: "Coca-Cola 330ml", category: "Drinks", price: 15, description: "Ice cold.", image: drinks, prepMinutes: 0 },
  { id: "fanta", name: "Fanta 330ml", category: "Drinks", price: 15, description: "Ice cold.", image: drinks, prepMinutes: 0 },
  { id: "sprite", name: "Sprite 330ml", category: "Drinks", price: 15, description: "Ice cold.", image: drinks, prepMinutes: 0 },
  { id: "water", name: "Still Water 500ml", category: "Drinks", price: 12, description: "Chilled.", image: drinks, prepMinutes: 0 },
  { id: "juice", name: "Orange Juice", category: "Drinks", price: 18, description: "Fresh and fruity.", image: drinks, prepMinutes: 0 },
];

export const OPTIONS = {
  chips: ["Regular", "Extra salt", "No salt", "Vinegar"],
  sauce: ["None", "Tomato", "Chilli", "Mayo", "Tartare"],
  fish: ["Battered", "Grilled"],
};

export const PROMOS = [
  { title: "Lunch Special", headline: "Fish & chips + drink", body: "Weekdays 11:00–14:30. Hake or chicken.", price: "R80", tone: "primary" as const },
  { title: "Family Combo", headline: "Feeds four hungry people", body: "Two fish, two chicken, chips, slaw, 2L drink.", price: "R230", tone: "accent" as const },
  { title: "Student Special", headline: "Show your card, save 15%", body: "Any main, any day with valid student ID.", price: "-15%", tone: "glass" as const },
];

export const REVIEWS = [
  { name: "Thabo M.", text: "Best chips in the area, hands down. The batter is light and the fish is always fresh." },
  { name: "Nomvula K.", text: "Family combo feeds everyone and never disappoints. We come every Sunday." },
  { name: "Lerato D.", text: "Ordered on WhatsApp, ready in 12 minutes. Friendly staff and hot food." },
];

export const FAQ = [
  { q: "Do you deliver?", a: "Yes, we deliver around Khayelitsha for a R25 fee. Collection is free." },
  { q: "How long does an order take?", a: "Most orders are ready in 10–20 minutes, longer during lunch and evening rush." },
  { q: "Which payments do you accept?", a: "Cash on collection/delivery, card on collection, and online payment (coming soon)." },
  { q: "Is the fish fresh?", a: "Yes — our hake is delivered fresh and battered to order." },
];

export const rand = (n: number) => `R${n.toFixed(2).replace(/\.00$/, "")}`;
