export function generateToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  randomValues.forEach((value) => {
    result += chars[value % chars.length];
  });

  return result;
}
