# ES3 editor fixtures

These are synthetic plaintext fixtures. They are not saves from a real game and
contain no personal data.

| File | Expected editor behavior |
| --- | --- |
| `valid-json-save.es3` | Open directly in the JSON tree editor. |
| `invalid-json-save.es3` | Offer **Open as-is** or **Repair and open** for several mixed syntax problems. |
| `invalid-unquoted-keys.es3` | Offer text or repair mode for unquoted keys. |
| `invalid-single-quotes.es3` | Offer text or repair mode for single-quoted strings. |
| `invalid-comments-trailing-commas.es3` | Offer text or repair mode for comments and trailing commas. |
| `irreparable-invalid-unicode.es3` | Reject editor opening because the invalid Unicode escape cannot be repaired safely. |
