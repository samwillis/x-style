(() => {
  // Aliases to aid in minification:
  var doc = document;
  var querySelectorAll = (e, s) => e.querySelectorAll(s);

  // Plugins, list of functions that take the css and return a new css
  var pluginsPre = [];
  var pluginsPost = [];

  /**
   * x-style
   * @param {string} attr - HTML attribute that contains the css, usually "css"
   * @param {boolean} [noMutate] - Don't mutate the DOM by adding attributes
   */
  var xstyle = (attr, noMutate) => {
    var styleEl;
    var style = "";
    var selectorCount = 0;
    var processedCss = new Map();
    var attributeForSelector = `${attr}-match`;

    var observer = new MutationObserver((mutations) => {
      for (var mutation of mutations) {
        if (mutation.type === "attributes") {
          processEl(mutation.target);
        } else if (mutation.type === "childList") {
          for (var el of mutation.addedNodes) {
            if (!(el instanceof HTMLElement)) continue;
            if (el.hasAttribute(attr)) {
              processEl(el);
            }
            [...querySelectorAll(el, `[${attr}]`)].forEach(processEl);
          }
        }
      }
      emitStyle();
    });

    var emitStyle = () => {
      if (style) {
        styleEl = doc.createElement("style");
        styleEl.innerHTML = style;
        doc.head.appendChild(styleEl);
        styleEl = null;
        style = "";
      }
    };

    var setAttribute = (el, rawCss) => {
      var selectorAttr = `${attributeForSelector}-${processedCss.get(rawCss)}`;
      var prop = '__'+attributeForSelector;
      if (el[prop]) {
        el.removeAttribute(el[prop]);
      }
      el.setAttribute(selectorAttr, '');
      el[prop] = selectorAttr;
      return selectorAttr;
    };

    /**
     * Process an element.
     * Extract the css from the attribute and add it to the style element.
     * If the css has already been processed, either add the attributeForSelector 
     * or do nothing.
     * The style element is added to the head on the next microtask.
     * @param {HTMLElement} el 
     */
    var processEl = (el) => {
      var rawCss = el.getAttribute(attr);
      var css;
      if (!rawCss || processedCss.has(rawCss)) {
        if (!noMutate) {
          setAttribute(el, rawCss);
        }
        return;
      }
      processedCss.set(rawCss, ++selectorCount);
      if (noMutate) {
        css = `[${attr}="${CSS.escape(rawCss)}"]`;
      } else {
        css = `[${setAttribute(el, rawCss)}]`;
      }
      pluginsPre.forEach((plugin) => rawCss = plugin(rawCss));
      css += ` { ${rawCss} }`;
      pluginsPost.forEach((plugin) => css = plugin(css));
      style += css + "\n";
    };

    querySelectorAll(doc, `[${attr}]`).forEach(processEl);
    emitStyle();
    observer.observe(doc.documentElement, {
      attributes: true,
      attributeFilter: [attr],
      childList: true,
      subtree: true,
    });
  }

  xstyle.pre = pluginsPre;
  xstyle.post = pluginsPost;
  xstyle.version = "0.0.3";

  window.xstyle = xstyle;
})();
