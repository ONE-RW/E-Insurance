/**
 * Guards against the well-known "Failed to execute 'removeChild'/'insertBefore' on 'Node'"
 * crash caused by the Google Translate Website widget.
 *
 * The widget rewrites live DOM text nodes directly (it wraps translated text in its own
 * <font>/<span> elements). React keeps its own model of the DOM tree and, during
 * reconciliation, calls native `Node.prototype.removeChild` / `Node.prototype.insertBefore`
 * assuming the node it last saw is still in the position it expects. If Google Translate has
 * since moved or replaced that node, the native call throws a DOMException and — because this
 * happens inside React's commit phase — it can crash the entire render tree with a blank
 * white screen.
 *
 * This module monkey-patches those two Node methods so that, when the assumption is violated
 * (i.e. the node React is trying to operate on is not actually a child of `this` / the
 * reference node is not actually a child of `this`), the call is treated as a no-op instead of
 * throwing. This is the standard, widely-documented community workaround for this exact
 * incompatibility between Google Translate and React.
 *
 * IMPORTANT: this file must be imported before anything else (see main.jsx) so the patch is in
 * place before React attaches to the DOM.
 */

if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild(child) {
    if (child && child.parentNode !== this) {
      if (typeof console !== "undefined") {
        console.warn(
          "[domPatchForTranslate] Ignored removeChild call for a node that is no longer a child " +
            "of its expected parent (likely moved by the Google Translate widget)."
        );
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (typeof console !== "undefined") {
        console.warn(
          "[domPatchForTranslate] Ignored insertBefore call whose reference node is no longer a " +
            "child of its expected parent (likely moved by the Google Translate widget)."
        );
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}
