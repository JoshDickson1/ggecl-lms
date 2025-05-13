import crypto from "crypto";

interface PasswordOptions {
  useUpper?: boolean;
  useLower?: boolean;
  useDigits?: boolean;
  usePunctuation?: boolean;
}

export function generatePassword(
  length: number = 12,
  options?: PasswordOptions
): string {
  const {
    useUpper = true,
    useLower = true,
    useDigits = true,
    usePunctuation = false,
  } = options || {};

  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const punctuation = "!@#$%^&*()_+[]{}|;:,.<>?";

  let characterPool = "";
  if (useUpper) characterPool += upperChars;
  if (useLower) characterPool += lowerChars;
  if (useDigits) characterPool += digits;
  if (usePunctuation) characterPool += punctuation;

  if (!characterPool) {
    throw new Error("No characters available to generate password.");
  }

  const passwordChars: string[] = [];
  if (useUpper) passwordChars.push(upperChars[randomInt(0, upperChars.length)]);
  if (useLower) passwordChars.push(lowerChars[randomInt(0, lowerChars.length)]);
  if (useDigits) passwordChars.push(digits[randomInt(0, digits.length)]);
  if (usePunctuation)
    passwordChars.push(punctuation[randomInt(0, punctuation.length)]);

  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(characterPool[randomInt(0, characterPool.length)]);
  }

  const shuffledPassword = shuffle(passwordChars);
  return shuffledPassword.join("");
}

function randomInt(min: number, max: number): number {
  return crypto.randomInt(min, max);
}

function shuffle(array: string[]): string[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
