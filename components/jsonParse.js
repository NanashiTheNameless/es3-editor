import { jsonrepair } from 'jsonrepair';

export function jsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (parseError) {
    try {
      return JSON.parse(jsonrepair(value));
    } catch {
      throw parseError;
    }
  }
}
