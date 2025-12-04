import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  /**
   * Validates the user's input against the expected answer with flexible rules.
   * Supports normalization, acronyms, and cross-language concept matching.
   * @param input - The user's input
   * @param expectedAnswer - The expected correct answer
   * @returns true if the input is valid, false otherwise
   */
  validateTypingAnswer(input: string, expectedAnswer: string): boolean {
    if (!input || !expectedAnswer) {
      return false;
    }

    const normalizedInput = this.normalizeText(input);
    const normalizedExpected = this.normalizeText(expectedAnswer);

    // Exact match after normalization
    if (normalizedInput === normalizedExpected) {
      return true;
    }

    // Check acronym matching (before normalization for acronym detection)
    if (this.isAcronymMatch(input.trim(), expectedAnswer.trim())) {
      return true;
    }

    // Check for abbreviation pattern: "ABBREV (Full Text)" - legacy support
    const abbrevMatch = normalizedExpected.match(/^(.+?)\s*\((.+)\)$/);
    if (abbrevMatch) {
      const abbreviation = abbrevMatch[1].trim();
      const fullText = abbrevMatch[2].trim();

      // Accept either the abbreviation or the full text
      if (normalizedInput === abbreviation || normalizedInput === fullText) {
        return true;
      }
    }

    return false;
  }

  /**
   * Normalizes text by trimming, converting to lowercase, collapsing spaces,
   * and removing trailing punctuation.
   */
  private normalizeText(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ') // collapse multiple spaces to single space
      .replace(/[.,!?;:]$/, ''); // remove trailing punctuation
  }

  /**
   * Checks if input and expected are acronym matches.
   * Handles both directions: acronym -> full text and full text -> acronym.
   */
  private isAcronymMatch(input: string, expected: string): boolean {
    // Determine which is the acronym and which is the full text
    const isInputAcronym = this.isAcronym(input);
    const isExpectedAcronym = this.isAcronym(expected);

    if (isInputAcronym && !isExpectedAcronym) {
      // Input is acronym, expected is full text
      return this.acronymMatchesText(input, expected);
    } else if (!isInputAcronym && isExpectedAcronym) {
      // Input is full text, expected is acronym
      return this.acronymMatchesText(expected, input);
    }

    // Both are acronyms or both are full text - no match
    return false;
  }

  /**
   * Determines if a string appears to be an acronym (letters only, no spaces, typically 2-5 chars).
   */
  private isAcronym(text: string): boolean {
    return /^[A-Za-z]{2,5}$/.test(text) && !/\s/.test(text);
  }

  /**
   * Checks if the given acronym matches the first letters of the full text words.
   */
  private acronymMatchesText(acronym: string, fullText: string): boolean {
    const words = fullText.split(/\s+/);
    if (words.length < acronym.length) {
      return false;
    }

    // Take first letters of first N words where N = acronym length
    const firstLetters = words
      .slice(0, acronym.length)
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    return firstLetters === acronym.toUpperCase();
  }
}
