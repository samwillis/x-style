/**
 * x-style
 * @param {string} attr - HTML attribute that contains the css, usually "x-style"
 */
((attr) => {
  var styleEl,
    style = "",
    processedCss = {},
    doc = document,
    rawCss,
    selectorAttr,
    nextId = 1,
    id;

  var processEl = (el) => {
    rawCss = el.getAttribute?.(attr);
    if (rawCss) {
      id = processedCss[rawCss] ??= nextId;
      selectorAttr = attr + id;
      el.removeAttribute(el[attr]);
      el.setAttribute(selectorAttr, "");
      el[attr] = selectorAttr;
      if (id == nextId) {
        style += `[${selectorAttr}]{${rawCss}}`;
        nextId++;
      }
    }
  };

  new MutationObserver((mutations) => {
    mutations.map((mutation) => {
      if (mutation.type == "childList") {
        mutation.addedNodes.forEach((el) => {
          processEl(el);
          [...(el.querySelectorAll?.(`[${attr}]`) || [])].map(processEl);
        });
      } else {
        processEl(mutation.target);
      }
    });
    if (style) {
      styleEl = doc.createElement("style");
      styleEl.innerHTML = style;
      doc.head.appendChild(styleEl);
      style = "";
    }
  }).observe(doc, {
    attributeFilter: [attr],
    childList: true,
    subtree: true,
  });
})("x-style");
