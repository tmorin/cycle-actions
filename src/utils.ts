export function arrayEqual(actionNamespace: Array<string>, sourceNamespace: Array<string>): boolean {
  for (let i = 0; i < sourceNamespace.length; i++) {
    if (actionNamespace[i] !== sourceNamespace[i]) {
      return false;
    }
  }
  return true;
}
