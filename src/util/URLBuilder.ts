/**
 * @fileoverview Utility: URLBuilder
 * - Simplifies the process of adding query parameters to a URL.
 * @author Rami Abdou
 */

export default class URLBuilder {
  private hasFirstParam = false;

  url: string;

  constructor(url: string) {
    if (url.includes('?')) this.hasFirstParam = true;
    this.url = url;
  }

  /**
   * Adds the query parameter either using a separating character '?' if it is
   * the first parameter and a '&' otherwise.
   */
  addParam = (key: string, value: string) => {
    if (!this.hasFirstParam) this.hasFirstParam = true;
    const separatingCharacter = this.hasFirstParam ? '?' : '&';
    this.url = `${this.url}${separatingCharacter}${key}=${value}`;
    return this;
  };
}
