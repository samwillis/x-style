(() => {
  /**
   * x-style plugin that implements @apply, extracting the css rules from the class
   * defined in the current document and inserting then into the new css.
   */

  var applyRE = /@apply ([^;}$]*);?/g;
  var resolvedClasses = {};

  var resolveClass = (className) => {
    if (className[0] !== ".") className = `.${className}`;
    if (!resolvedClasses[className]) {
      const matchingRules = [];
      for (const stylesheet of document.styleSheets) {
        for (const rule of stylesheet.cssRules) {
          if (rule.selectorText === className) {
            matchingRules.push(rule);
          }
        }
      }
      return matchingRules
        .map((rule) => {
          const text = rule.cssText;
          return text.slice(text.indexOf("{") + 1, text.lastIndexOf("}"));
        })
        .join(" ");
    }
    return resolvedClasses[className];
  };

  var doApply = (css) => {
    return css.replace(applyRE, (match, p1) => {
      return p1.split(" ").map(resolveClass).join(" ");
    });
  };

  xstyle.pre.push(doApply);
})();