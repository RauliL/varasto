/**
 * Exception that is thrown when attempting to access to a namespace that is
 * not mapped to an validation schema.
 */
export class UnrecognizedNamespaceError extends Error {
  public constructor(namespace: string) {
    super(`Unrecognized namespace: ${namespace}`);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = UnrecognizedNamespaceError.name;
  }
}
