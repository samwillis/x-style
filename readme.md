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
library uses a `[x-style="${CSS.escape(cssFromAttribute)}"]` selector to find the
styles and apply them. If you add additional elements or change styles after the page 
loads the library will automatically update the styles.

x-style is tiny, as little as 1.8kb with the unnest plugin or 856 bytes without,
and designed to be pasted directily into your html, this ensures that it runs 
synchronously, as your pages loads, with no FOUC (flash of unstyled content).

In the newsest browseres - Chrome 112+ and Safari Tech Preview - the nested styles work
without any extra code, but for "older" browsers you need to use the `x-style-unnest.js`
plugin.

## Why?

Untility class toolkits like Tailwind have shown that defining styles inline can be
better than using a css file. It encapulates the style with the component, making it 
easier to understand and maintain, this is known as 
[locality of behavour](https://htmx.org/essays/locality-of-behaviour/). 
When used in combination with a component based framework it results in a very clean 
and maintainable code.

However, increasingly these frameworks are implimenting more and more css as classes, 
creating a domain specific language shoe horned into the css class system that is not 
easy to understand. The aim of x-style is to allow this locality of behavour, but by 
using native css syntax. Additionally these toolkits require seporate tooling or build 
steps, neither of which are needed with x-style.

z-style is the ideal companion to tools such as [htmx](http://htmx.org) and 
[Alpine.js](http://alpinejs.dev).

## How to use

The recommented minimal setup is to add this to your `<head>` directily before `</head>`:

```html
<script>
// x-style core:
(()=>{var u=document,h=(e,t)=>e.querySelectorAll(t),f=[],b=[],e=(a,i)=>{var s,o,
l=0,c=new Map,d=a+"-match",e=new MutationObserver(e=>{for(var t of e)if(
"attributes"===t.type)n(t.target);else if("childList"===t.type)for(
var r of t.addedNodes)r instanceof HTMLElement&&(r.hasAttribute(a)&&n(r),[...h(r
,`[${a}]`)].forEach(n))}),n=e=>{var t,r=e.getAttribute(a);!r||c.has(r
)?i&&e.setAttribute(d,c.get(r)):(l++,c.set(r,l),t=i?(e.setAttribute(d,l),
`[${d}="${l}"]`):`[${a}="${CSS.escape(r)}"]`,f.forEach(e=>r=e(r)),t+=` { ${r} }`
,b.forEach(e=>t=e(t)),(s=s||u.createElement("style")).appendChild(
u.createTextNode(t)),o||(o=!0,queueMicrotask(()=>{u.head.appendChild(s),s=null,
o=!1})))};h(u,`[${a}]`).forEach(n),e.observe(u.documentElement,{attributes:!0,
attributeFilter:[a],childList:!0,subtree:!0})};e.pre=f,e.post=b,
e.version="0.0.1",window.xstyle=e})();
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

There is an optional second boolean parameter that will add a `x-style-match` attribute
to the elements that have had their styles applied. This is used instead of what can
be a very long `x-style` attribute value for the seelector. However as this mutatese the
DOM it may cause problems with some frameworks, the defult behaviour does not mutate
the DOM at all.

```js
xstyle("x-style", true);
```

See below for details on activating the `envvar` and `@apply` plugins.

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

The implimentation is not perfect, but it works well enough for most cases. This is
intentional so as to keep the code small and fast. An alternative would be to used
a browser build of postcss, but that would be about 100kb and async resulting in a
flash of unstyled content.

### x-style-envvar.js

The envvar plugin adds support for custom 
[environment variables](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
in styles. As it's not possible to use `var()` in media queries (custom properties are 
part of the cascade and reqire a DOM node which media queries dont have), this plugin 
also adds support for defining custom enviroment varibles which are then substituted in 
your css. Custom environment varibles are planned for css, but there is not yet any 
standard for defining them.

You define a custom environment variables via js like this:

```js
xstyle.env = {
  "--my-break-point": "800px",
};
```

You can then use the custom environment variable in your css like this:

```css
@media (min-width: env(--my-break-point)) {
  /* ... */
}
```

Note that this implimentation of enviroment variablese does not update the css when the
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


To use the plugin, add the following to the xstyle `<script>` in the `<head>`
immediately after the xstyle code but befor the `xstyle("x-style")` call:

```html
(()=>{var s=/@apply ([^;}$]*);?/g,n={},t=e=>{if("."!==e[0]&&(e="."+e),n[e]
)return n[e];var s=[];for(const t of document.styleSheets)for(
const r of t.cssRules)r.selectorText===e&&s.push(r);return s.map(e=>{e=e.cssText
return e.slice(e.indexOf("{")+1,e.lastIndexOf("}"))}).join(" ")};
xstyle.pre.push(e=>e.replace(s,(e,s)=>s.split(" ").map(t).join(" ")))})();
```
