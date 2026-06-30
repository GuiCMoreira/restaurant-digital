export interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  image: string;
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
      { id: "x-burguer", name: "X-Burguer", price: 25.9, emoji: "🍔", image: "/images/menu/x-burger.jpeg" },
      { id: "x-salada", name: "X-Salada", price: 23.9, emoji: "🥗", image: "/images/menu/x-salada.jpeg" },
      { id: "x-bacon", name: "X-Bacon", price: 28.9, emoji: "🥓", image: "/images/menu/x-bacon.jpeg" },
    ],
  },
  {
    id: "pizzas",
    name: "Pizzas",
    items: [
      { id: "pizza-margherita", name: "Pizza Margherita", price: 45.0, emoji: "🍕", image: "/images/menu/Pizza_margherita.jpeg" },
      { id: "pizza-calabresa", name: "Pizza Calabresa", price: 42.0, emoji: "🍕", image: "/images/menu/pizza-calabresa.jpeg" },
      { id: "pizza-frango", name: "Pizza Frango", price: 44.0, emoji: "🍗", image: "/images/menu/pizza-frango.jpeg" },
    ],
  },
  {
    id: "bebidas",
    name: "Bebidas",
    items: [
      { id: "suco-laranja", name: "Suco de Laranja", price: 12.0, emoji: "🍊", image: "/images/menu/suco-laranja.jpeg" },
      { id: "coca-cola", name: "Coca-Cola", price: 8.0, emoji: "🥤", image: "/images/menu/Coca-cola.jpeg" },
      { id: "agua-mineral", name: "Água Mineral", price: 5.0, emoji: "💧", image: "/images/menu/Água_mineral.jpeg" },
      { id: "cerveja-artesanal", name: "Cerveja Artesanal", price: 18.0, emoji: "🍺", image: "/images/menu/Cerveja_artesanal.jpeg" },
    ],
  },
  {
    id: "sobremesas",
    name: "Sobremesas",
    items: [
      { id: "brownie", name: "Brownie", price: 15.0, emoji: "🍫", image: "/images/menu/Brownie.jpeg" },
      { id: "sorvete", name: "Sorvete", price: 12.0, emoji: "🍦", image: "/images/menu/sorvete.jpeg" },
    ],
  },
];
