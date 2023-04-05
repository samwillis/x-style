// Snippet to count the number of unique classes in a page
(new Set([...document.querySelectorAll('[class]')].map(el => el.getAttribute('class')))).size

/*
Sites using tailwindcss:
  - openai.com: 181
  - tailwindcss.com: 507
  - lemonsqueezy.com: 238
  - shopify.com: 387
  - top10.netflix.com: 253
  - theverge.com: 229
  - githubnext.com: 122
  - planetscale.com: 534
  - mashable.com: 166
  - dotnet.microsoft.com: 159
  - io.google/2022/: 226
  - spiegel.de: 851

  Average: 321
*/