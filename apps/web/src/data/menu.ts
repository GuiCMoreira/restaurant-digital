export interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export const menu: MenuCategory[] = [
  {
    id: "lanches",
    name: "Lanches",
    items: [
      { id: "x-burguer", name: "X-Burguer", price: 25.9, emoji: "🍔" },
      { id: "x-salada", name: "X-Salada", price: 23.9, emoji: "🥗" },
      { id: "x-bacon", name: "X-Bacon", price: 28.9, emoji: "🥓" },
    ],
  },
  {
    id: "pizzas",
    name: "Pizzas",
    items: [
      { id: "pizza-margherita", name: "Pizza Margherita", price: 45.0, emoji: "🍕" },
      { id: "pizza-calabresa", name: "Pizza Calabresa", price: 42.0, emoji: "🍕" },
      { id: "pizza-frango", name: "Pizza Frango", price: 44.0, emoji: "🍗" },
    ],
  },
  {
    id: "bebidas",
    name: "Bebidas",
    items: [
      { id: "suco-laranja", name: "Suco de Laranja", price: 12.0, emoji: "🍊" },
      { id: "coca-cola", name: "Coca-Cola", price: 8.0, emoji: "🥤" },
      { id: "agua-mineral", name: "Água Mineral", price: 5.0, emoji: "💧" },
      { id: "cerveja-artesanal", name: "Cerveja Artesanal", price: 18.0, emoji: "🍺" },
    ],
  },
  {
    id: "sobremesas",
    name: "Sobremesas",
    items: [
      { id: "brownie", name: "Brownie", price: 15.0, emoji: "🍫" },
      { id: "sorvete", name: "Sorvete", price: 12.0, emoji: "🍦" },
    ],
  },
];
