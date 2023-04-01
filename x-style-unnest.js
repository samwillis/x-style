(() => {
  /**
   * x-style plugin that unnests the css if the browser doesn't support nested
   * selectors.
   */
  var nestedSupported = CSS.supports("selector(&)");
  var xstyle = window.xstyle;

  /**
   * Combine two selectors into a single selector for unnesting.
   * @param {string} first - First selector
   * @param {string} second - Second selector
   * @returns {string} - Combined selector
   * @example
   * combineSelectors("div", "span") // "div span"
   * combineSelectors("div", "& span") // "div span"
   * combineSelectors("div", "&.foo") // "div.foo"
   * combineSelectors("div", ".test &") // ".test div"
   * combineSelectors("div", ".test &:hover &") // ".test div:hover div"
   */
  var combineSelectors = (first, second) => {
    var wsStart = second.match(/^\s*/)[0];
    var wsEnd = second.match(/\s*$/)[0];
    var i = 0;
    var c;
    first = first.trim();
    second = second.trim();
    // Check if first selector is a list of selectors separated by commas.
    // If so, wrap the list in :is() pseudo-class.
    // This check takes into account escaped characters, quoted strings and
    // parentheses for other pseudo-classes such as :is() and :not().
    while (i < first.length) {
      c = first[i];
      if (c === "\\") {
        // Escape next character, skip it
        i += 2;
      } else if (c === '"' || c === "'") {
        var endC = c;
        // Skip quoted string
        i++;
        while (c !== endC) {
          c = first[i];
          i += c === "\\" ? 2 : 1;
        }
        i++;
      } else if (c === "(") {
        var braceCount = 1;
        while (c !== ")" && braceCount > 0) {
          c = first[i];
          if (c === "(") braceCount++;
          if (c === ")") braceCount--;
          i++;
        }
      } else if (c === ",") {
        // First selector is a list of selectors separated by commas.
        // Wrap the list in :is() pseudo-class.
        first = ":is(" + first + ")";
        break;
      } else {
        i++;
      }
    }
    // Split second selector into a list of selectors separated by commas.
    const both = [...second.match(/(\\.|[^,])+/g)]
      .map((selector) => {
        selector = selector.trim();
        // Replace & with first selector
        var selectorUpdated = selector.replace(/(^|[^\\])(&)/g, "$1" + first);
        if (selectorUpdated === selector) {
          // If & was not found, append first selector to second selector
          selectorUpdated = first + " " + selector;
        }
        return selectorUpdated;
      })
      .join(", ");
    return wsStart + both + wsEnd;
  };

  /**
   * Unnest nested CSS
   * @param {string} css - CSS to unnest
   * @returns {string} - Unnested CSS
   */
  var unnestCSS = (css) => {
    if (nestedSupported) return css;
    // Remove comments
    css = css.replace(/\/\*[^*]*\*+([^/][^*]*\*+)*\//g, "");
    var context = "";
    var out = "";
    var i = 0;
    var c;
    var block = "";
    var l = css.length;
    var selectors = [];
    var atRuleStack = [];
    var emitBlock = () => {
      if (!block.match(/\S/)) return;
      out += selectors[selectors.length - 1] + "{" + block + "}";
      block = "";
    };
    while (i < l) {
      c = css[i];
      if (c === "\\") {
        // Escape next character
        context += css.slice(i, i + 2);
        i += 2;
      } else if (c === ";") {
        // Context is a property, add it to the block
        block += context + c;
        context = "";
        i++;
      } else if (c === "}") {
        // Context is the last property, add it to the block and emit the block
        block += context;
        context = "";
        emitBlock();
        if (atRuleStack.pop()) {
          out += c;
        } else {
          selectors.pop();
        }
        i++;
      } else if (c === "{") {
        // Context is a selector
        // Emit the last block if there is one
        // Combine the current selector with the parent selector
        // Add the new selector to the list of selectors
        emitBlock();
        var currentSelector = selectors[selectors.length - 1];
        var newSelector = context;
        if (newSelector.match(/^\s*@/)) {
          atRuleStack.push(true);
          out += newSelector + c;
        } else {
          if (currentSelector) {
            newSelector = combineSelectors(currentSelector, newSelector);
          }
          selectors.push(newSelector);
          atRuleStack.push(false);
        }
        context = "";
        i++;
      } else {
        context += c;
        i++;
      }
    }

    return out;
  }

  xstyle.post.push(unnestCSS);
  xstyle.unnest = unnestCSS;
})();
