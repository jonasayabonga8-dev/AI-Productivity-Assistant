import hero from "@/assets/tacos-hero.jpg";
import chicken from "@/assets/tacos-chicken.jpg";
import veggie from "@/assets/tacos-veggie.jpg";
import nachos from "@/assets/tacos-nachos.jpg";
import drinks from "@/assets/drinks.jpg";

export const BUSINESS = {
  name: "Ayas Delicious Tacos",
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

export const CATEGORIES = ["Tacos", "Chicken", "Vegetarian", "Nachos", "Combos", "Extras", "Drinks"] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_IMAGES: Record<Category, string> = {
  Tacos: hero, Chicken: chicken, Vegetarian: veggie, Nachos: nachos, Combos: hero, Extras: nachos, Drinks: drinks,
};
export type MenuItem = {
  id: string; name: string; category: Category; price: number; description: string;
  image: string; popular?: boolean; prepMinutes: number; customisable?: boolean;
};
export const MENU: MenuItem[] = [
  { id: "beef-tacos", name: "Beef Tacos", category: "Tacos", price: 65, description: "Two grilled beef tacos with onion, coriander and salsa.", image: hero, popular: true, prepMinutes: 12, customisable: true },
  { id: "taco-trio", name: "Taco Trio", category: "Tacos", price: 85, description: "Beef, chicken and veggie. Three tacos, all the flavour.", image: hero, prepMinutes: 14, customisable: true },
  { id: "chicken-tacos", name: "Chicken Tacos", category: "Chicken", price: 55, description: "Two grilled chicken tacos with pico de gallo and avocado.", image: chicken, popular: true, prepMinutes: 12, customisable: true },
  { id: "spicy-chicken-tacos", name: "Spicy Chicken Tacos", category: "Chicken", price: 60, description: "Two chicken tacos with chilli salsa, lime and coriander.", image: chicken, prepMinutes: 12, customisable: true },
  { id: "veggie-tacos", name: "Veggie Tacos", category: "Vegetarian", price: 50, description: "Two tacos with roasted peppers, beans, corn and avocado.", image: veggie, popular: true, prepMinutes: 10, customisable: true },
  { id: "loaded-nachos", name: "Loaded Nachos", category: "Nachos", price: 60, description: "Golden tortilla chips, cheese, beans, salsa and jalapeños.", image: nachos, prepMinutes: 10, customisable: true },
  { id: "sharing-nachos", name: "Sharing Nachos", category: "Nachos", price: 85, description: "A generous loaded nacho platter for the table.", image: nachos, prepMinutes: 12, customisable: true },
  { id: "beef-taco-combo", name: "Beef Taco Combo", category: "Combos", price: 80, description: "Two beef tacos and a cold drink.", image: hero, prepMinutes: 13, customisable: true },
  { id: "chicken-taco-combo", name: "Chicken Taco Combo", category: "Combos", price: 75, description: "Two chicken tacos and a cold drink.", image: chicken, prepMinutes: 13, customisable: true },
  { id: "taco-family-combo", name: "Family Taco Feast", category: "Combos", price: 230, description: "Eight mixed tacos, sharing nachos and a 2L drink.", image: hero, popular: true, prepMinutes: 20, customisable: true },
  { id: "guacamole", name: "Guacamole", category: "Extras", price: 15, description: "A side of creamy avocado guacamole.", image: hero, prepMinutes: 1 },
  { id: "taco-cheese", name: "Extra Cheese", category: "Extras", price: 8, description: "An extra helping of cheese for your tacos.", image: nachos, prepMinutes: 1 },
  { id: "salsa", name: "Fresh Salsa", category: "Extras", price: 7, description: "Tomato, onion, coriander and a little kick.", image: hero, prepMinutes: 1 },
  { id: "coke", name: "Coca-Cola 330ml", category: "Drinks", price: 15, description: "Ice cold.", image: drinks, prepMinutes: 0 },
  { id: "fanta", name: "Fanta 330ml", category: "Drinks", price: 15, description: "Ice cold.", image: drinks, prepMinutes: 0 },
  { id: "sprite", name: "Sprite 330ml", category: "Drinks", price: 15, description: "Ice cold.", image: drinks, prepMinutes: 0 },
  { id: "water", name: "Still Water 500ml", category: "Drinks", price: 12, description: "Chilled.", image: drinks, prepMinutes: 0 },
  { id: "juice", name: "Orange Juice", category: "Drinks", price: 18, description: "Fresh and fruity.", image: drinks, prepMinutes: 0 },
];
export const OPTIONS = {
  tortilla: ["Soft corn", "Soft flour"],
  sauce: ["Tomato salsa", "Chilli salsa", "None"],
  heat: ["Mild", "Medium", "Hot"],
};
export const PROMOS = [
  { title: "Lunch Special", headline: "Two tacos + a drink", body: "Weekdays 11:00–14:30. Choose beef or chicken.", price: "R80", tone: "primary" as const },
  { title: "Family Taco Feast", headline: "Bring the whole crew", body: "Eight mixed tacos, sharing nachos and a 2L drink.", price: "R230", tone: "accent" as const },
  { title: "Student Special", headline: "Show your card, save 15%", body: "Any main, any day with valid student ID.", price: "-15%", tone: "glass" as const },
];
export const FAQ = [
  { q: "Do you deliver?", a: "Delivery costs R25. Contact us to confirm your address is in our delivery area. Collection from Cape Town CBD is free." },
  { q: "How long does an order take?", a: "Most orders are ready in 10–20 minutes, longer during lunch and evening rush." },
  { q: "Which payments do you accept?", a: "Cash on collection/delivery and card on collection. Online card payments through Yoco are being set up." },
  { q: "Do you have vegetarian options?", a: "Yes — try our Veggie Tacos with roasted peppers, beans, corn and avocado. Please confirm any allergies or dietary requirements with staff." },
];
export const rand = (n: number) => `R${n.toFixed(2).replace(/\.00$/, "")}`;
