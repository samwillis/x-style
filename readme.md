# x-style

## Adding full css support to inline styles

x-style is a tiny library that adds full css support to inline styles, it allows you to 
define style **inline** in your html by using the new nested style syntax:

```html
<div x-style="
  color: red;
  font-size: 30px;
  &:hover {
    background-color: yellow;
  }
  & > span {
    color: green;
  }
">
  Hello <span>World</span>
</div>
```

## Plugins:

### unnest

The unnest adds support for old browsers that don't support nested styles.

### envvar

The envvar plugin adds support for custom environment variables in styles.

### apply

The apply plugin implements `@apply`, extracting the css rules from the class defined in
the current document and inserting then into the new css.
