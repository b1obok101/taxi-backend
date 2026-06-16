// Форматирование и валидация российских номеров телефона.
// Приводит ввод к виду: +7 (XXX) XXX-XX-XX

export function formatPhone(input: string): string {
  let digits = input.replace(/\D/g, "");

  if (digits === "") {
    return "";
  }

  // Нормализуем код страны: 8XXXXXXXXXX и 7XXXXXXXXXX -> 7XXXXXXXXXX
  if (digits[0] === "8") {
    digits = "7" + digits.slice(1);
  } else if (digits[0] !== "7") {
    // Пользователь начал с 9XX... — считаем это российским номером
    digits = "7" + digits;
  }

  digits = digits.slice(0, 11);
  const rest = digits.slice(1); // до 10 цифр после кода страны

  let result = "+7";
  if (rest.length > 0) result += " (" + rest.slice(0, 3);
  if (rest.length >= 3) result += ")";
  if (rest.length > 3) result += " " + rest.slice(3, 6);
  if (rest.length > 6) result += "-" + rest.slice(6, 8);
  if (rest.length > 8) result += "-" + rest.slice(8, 10);

  return result;
}

export function isValidPhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  return digits.length === 11 && (digits[0] === "7" || digits[0] === "8");
}

export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits[0] === "8") {
    digits = "7" + digits.slice(1);
  }
  return "+" + digits;
}
