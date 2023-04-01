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
   * @param {boolean} [addAttributeForSelector] - Generate an attribute to use as the selector
   */
  var xstyle = (attr, addAttributeForSelector) => {
    var styleEl;
    var microtaskQueued;
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
    });

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
      if (!rawCss || processedCss.has(rawCss)) {
        if (addAttributeForSelector) {
          el.setAttribute(attributeForSelector, processedCss.get(rawCss));
        }
        return;
      }
      selectorCount++;
      processedCss.set(rawCss, selectorCount);

      var css;
      if (addAttributeForSelector) {
        el.setAttribute(attributeForSelector, selectorCount);
        css = `[${attributeForSelector}="${selectorCount}"]`;
      } else {
        css = `[${attr}="${CSS.escape(rawCss)}"]`;
      }
      pluginsPre.forEach((plugin) => rawCss = plugin(rawCss));
      css += ` { ${rawCss} }`;
      pluginsPost.forEach((plugin) => css = plugin(css));
      if (!styleEl) {
        styleEl = doc.createElement("style");
      }
      styleEl.appendChild(doc.createTextNode(css));

      if (!microtaskQueued) {
        microtaskQueued = true;
        queueMicrotask(() => {
          doc.head.appendChild(styleEl);
          styleEl = null;
          microtaskQueued = false;
        });
      }
    };

    querySelectorAll(doc, `[${attr}]`).forEach(processEl);
    observer.observe(doc.documentElement, {
      attributes: true,
      attributeFilter: [attr],
      childList: true,
      subtree: true,
    });
  }

  xstyle.pre = pluginsPre;
  xstyle.post = pluginsPost;
  xstyle.version = "0.0.1";

  window.xstyle = xstyle;
})();
