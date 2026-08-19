const colorLabels: Record<string, string> = {
  blue: "Xanh dương",
  green: "Xanh lá",
  red: "Đỏ",
  yellow: "Vàng",
  purple: "Tím",
  orange: "Cam",
  pink: "Hồng",
  brown: "Nâu",
  gray: "Xám",
  grey: "Xám",
  black: "Đen",
  white: "Trắng",
  navy: "Xanh navy",
  tortoise: "Nâu đồi mồi",
};

export function formatColor(value: string): string {
  return colorLabels[value.trim().toLowerCase()] ?? value;
}
