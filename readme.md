# x-style - A Tiny Inline Nested CSS Library

x-style is a tiny library that adds full css support to inline styles, allowing you to
define style where they are being used with the new nested syntax:

```html
<div
  x-style="
  color: red;
  font-size: 30px;
  &:hover {
    background-color: yellow;
  }
  & > span {
    color: green;
    &::after {
      display: inline;
      content: '!';
    }
  }
"
>
  Hello <span>World</span>
</div>
```

See the [demo](http://samwillis.co.uk/x-style/) for more examples.

The styles are only parsed once so repeated use of the same style is very fast, the
library an attribute to each element for use by a css selector to find the
styles and apply them. If you add additional elements or change styles after the page 
loads the library will automatically find and update the styles.

x-style is tiny, as little as 1.8kb with the unnest plugin or 856 bytes without,
and designed to be pasted directly into your html, this ensures that it runs 
synchronously, as your pages loads, with no FOUC (flash of unstyled content).

In the newest browsers - Chrome 112+ and Safari Tech Preview - the nested styles work
without any extra code, but for "older" browsers you need to use the `x-style-unnest.js`
plugin.

## Why?

Utility class toolkits like Tailwind have shown that defining styles inline can be
better than using a css file. It encapsulated the style with the component, making it 
easier to understand and maintain, this is known as 
["locality of behaviour"](https://htmx.org/essays/locality-of-behaviour/). 
When used in combination with a component based framework it results in a very clean 
and maintainable code.

However, increasingly these frameworks are implementing more and more css as classes, 
creating a domain specific language shoe horned into the css class system that is not 
easy to understand. The aim of x-style is to allow this locality of behaviour, but by 
using native css syntax. Additionally these toolkits require separate tooling or build 
steps, neither of which are needed with x-style.

x-style is the ideal companion to tools such as [htmx](http://htmx.org) and 
[Alpine.js](http://alpinejs.dev).

## How to use

The recommended minimal setup is to add this to your `<head>` directly before `</head>`:

```html
<script>
// x-style core:
(()=>{var r=document,f=(e,t)=>e.querySelectorAll(t),h=[],b=[],e=(a,i)=>{var e,
o="",s=0,n=new Map,l=a+"-match",t=new MutationObserver(e=>{for(var t of e)if(
"attributes"===t.type)d(t.target);else if("childList"===t.type)for(
var r of t.addedNodes)r instanceof HTMLElement&&(r.hasAttribute(a)&&d(r),[...f(r
,`[${a}]`)].forEach(d));u()}),u=()=>{o&&((e=r.createElement("style")
).innerHTML=o,r.head.appendChild(e),e=null,o="")},c=(e,t)=>{var t=l+"-"+n.get(t)
,r="__"+l;return e[r]&&e.removeAttribute(e[r]),e.setAttribute(t,""),e[r]=t},
d=e=>{var t,r=e.getAttribute(a);!r||n.has(r)?i||c(e,r):(n.set(r,++s),
t=i?`[${a}="${CSS.escape(r)}"]`:`[${c(e,r)}]`,h.forEach(e=>r=e(r)),
t+=` { ${r} }`,b.forEach(e=>t=e(t)),o+=t+"\n")};f(r,`[${a}]`).forEach(d),u(),
t.observe(r.documentElement,{attributes:!0,attributeFilter:[a],childList:!0,
subtree:!0})};e.pre=h,e.post=b,e.version="0.0.3",window.xstyle=e})();
// x-style unnest plugin:
(()=>{var c=CSS.supports("selector(&)"),r=window.xstyle,e=r=>{if(c)return r;
r=r.replace(/\/\*[^*]*\*+([^/][^*]*\*+)*\//g,"");for(var e,t,s,a="",p="",h=0,
i="",l=r.length,n=[],o=[],u=()=>{i.match(/\S/)&&(p+=n[n.length-1]+"{"+i+"}",i=""
)};h<l;)"\\"===(s=r[h])?(a+=r.slice(h,h+2),h+=2):(";"===s?(i+=a+s,a=""
):"}"===s?(i+=a,a="",u(),o.pop()?p+=s:n.pop()):"{"===s?(u(),e=n[n.length-1],(t=a
).match(/^\s*@/)?(o.push(!0),p+=t+s):(e&&(t=((t,r)=>{var e,s=r.match(/^\s*/)[0],
a=r.match(/\s*$/)[0],p=0;for(t=t.trim(),r=r.trim();p<t.length;)if("\\"===(e=t[p]
))p+=2;else if('"'===e||"'"===e){var h=e;for(p++;e!==h;)p+="\\"===(e=t[p])?2:1;
p++}else if("("===e)for(var i=1;")"!==e&&0<i;)"("===(e=t[p])&&i++,")"===e&&i--,
p++;else{if(","===e){t=":is("+t+")";break}p++}return s+[...r.match(
/(\\.|[^,])+/g)].map(r=>{var e=(r=r.trim()).replace(/(^|[^\\])(&)/g,"$1"+t);
return e=e===r?t+" "+r:e}).join(", ")+a})(e,t)),n.push(t),o.push(!1)),a=""):a+=s
,h++);return p};r.post.push(e),r.unnest=e})();
// Activate x-style with the "x-style" attribute:
xstyle("x-style");
</script>
```

This is both the core x-style code and the unnest plugin. The `xstyle("x-style")`
activates the library, it will find all elements with the `x-style` attribute and
process their styles.

Alternatively you can link to the x-style code and plugins directly, however as they are
tiny it is bette, and quicker, to inline them.

There is an optional second boolean parameter that disables adding a `x-style-match` 
attribute to the elements that have had their styles applied. Instead the naked 
`x-style` attribute value if used for the selector, but this can be quite slow. As this 
mutates the DOM it may cause problems with some frameworks, if so set this to `true` to 
disable the behaviour.

```js
xstyle("x-style", true);
```

See below for details on activating the `envvar` and `@apply` plugins.

Finally, you can also load it from a cdn:

```html
<script src="https://www.unpkg.com/@sgwillis/x-style@0.0.1/dist/x-style-all.min.js"></script>
<script>
xstyle("x-style");
</script>
```

## Plugins:

There are a number of tiny plugins that add extra functionality to x-style. At a minimum
you probably want to use the `x-style-unnest.js` plugin to add support for "old"
browsers - well most browsers - that don't support nested styles.

Plugins are loaded by adding the plugins code to the page `<head>` directly after the
x-style code.

### x-style-unnest.js

The unnest plugin adds support for old browsers that don't support nested styles. It 
does this by parsing the style and unnesting it, so the above example would be 
converted to:

```css
div[x-style="xxx"] {
  color: red;
  font-size: 30px;
}
div[x-style="xxx"]:hover {
  background-color: yellow;
}
div[x-style="xxx"] > span {
  color: green;
}
```

It also supports the `@media`, `@supports` and other `@` rules, correctly promoting
the "at" rules to the top level.

The implementation is not perfect, but it works well enough for most cases. This is
intentional so as to keep the code small and fast. An alternative would be to used
a browser build of postcss, but that would be about 100kb (100x the size of x-style) 
and async resulting in a flash of unstyled content.

### x-style-envvar.js

The envvar plugin adds support for custom 
[environment variables](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
in styles. As it's not possible to use `var()` in media queries (custom properties are 
part of the cascade and require a DOM node which media queries don't have), this plugin 
adds support for defining custom environment variables which are then substituted in 
your css. Custom environment variables are planned for css, but there is not yet any 
standard for defining them.

You define custom environment variables for x-style via js like this:

```js
xstyle.env = {
  "--my-break-point": "800px",
};
```

You can then use the custom environment variables in your css like this:

```css
@media (min-width: env(--my-break-point)) {
  /* ... */
}
```

Note that this implementation of environment variables does not update the css when the
value changes.

To use the plugin, add the following to the x-style `<script>` in the `<head>`
immediately after the x-style code but before the `xstyle("x-style")` call:

```html
(()=>{var r=window.xstyle;r.env=r.env||{},r.pre.push(e=>{for(var n,t,i,l=r.env,
p=[...e.split(/\senv\((--[^),]+)/g)];1<p.length;)n=p.pop(),t=p.pop().trim(),
")"===n[0]?n=n.slice(1):","===n[0]&&([i,n]=n.split(")",2)),void 0!==l[t]?p[
p.length-1]+=" "+l[t]+n:p[p.length-1]+=i?" "+i.slice(1).trim()+n:" "+n;return p[
0]})})();
```

### x-style-apply.js

The apply plugin implements `@apply`, extracting the css rules from the class defined in
the current document and inserting then into the new css.

So, if you have a class defined like this:

```css
.my-class {
  color: red;
}
```

You can then use it like this:

```html
<div
  x-style="
  &:hover {
    @apply my-class;
  }
"
>
  Hello
</div>
```

This is not a official standard, and is unlikely to be, but it's a very useful feature. 
However it is recommended that you use `var()` instead as it's a standard.

To use the plugin, add the following to the xstyle `<script>` in the `<head>`
immediately after the xstyle code but before the `xstyle("x-style")` call:

```html
(()=>{var s=/@apply ([^;}$]*);?/g,n={},t=e=>{if("."!==e[0]&&(e="."+e),n[e]
)return n[e];var s=[];for(const t of document.styleSheets)for(
const r of t.cssRules)r.selectorText===e&&s.push(r);return s.map(e=>{e=e.cssText
return e.slice(e.indexOf("{")+1,e.lastIndexOf("}"))}).join(" ")};
xstyle.pre.push(e=>e.replace(s,(e,s)=>s.split(" ").map(t).join(" ")))})();
```
