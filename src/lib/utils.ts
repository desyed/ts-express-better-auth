export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
export const isPasswordValid = (password: string) => {
  return passwordRegex.test(password);
};

export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}
