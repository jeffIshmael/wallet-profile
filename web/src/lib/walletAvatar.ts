export function walletAvatarColors(address: string): [string, string] {
  const hash = address.slice(2, 10);
  const hue1 = parseInt(hash.slice(0, 4), 16) % 360;
  const hue2 = (hue1 + 40 + (parseInt(hash.slice(4, 8), 16) % 60)) % 360;
  return [`hsl(${hue1}, 65%, 45%)`, `hsl(${hue2}, 70%, 35%)`];
}
