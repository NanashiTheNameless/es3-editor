import { jsonrepair } from 'jsonrepair';

export function jsonParse(value) {
  return JSON.parse(value);
}

export function inspectJSON(value) {
  try {
    return {
      isValid: true,
      isRepairable: false,
      parsed: jsonParse(value)
    };
  } catch (parseError) {
    try {
      const repaired = jsonrepair(value);

      return {
        isValid: false,
        isRepairable: true,
        parseError,
        parsed: jsonParse(repaired),
        repaired
      };
    } catch {
      return {
        isValid: false,
        isRepairable: false,
        parseError
      };
    }
  }
}
