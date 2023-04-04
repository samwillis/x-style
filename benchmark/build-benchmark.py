

x_style = ''
# with open('../dist/x-style.min.js', 'r') as f:
#     x_style += f.read()
# x_style += '\n'
# with open('../dist/x-style-unnest.min.js', 'r') as f:
#     x_style += f.read()
with open('../x-style.js', 'r') as f:
    x_style += f.read()
x_style += '\n'
with open('../x-style-unnest.js', 'r') as f:
    x_style += f.read()

fonts = [
    'serif',
    'sans-serif',
    'monospace',
]

font_sizes = [f'{n}px' for n in range(12, 48, 4)]

border_colors = [
    '#f00',
    '#0f0',
    '#00f',
    '#ff0',
    '#0ff',
    '#f0f',
]

border_widths = [f'{n}px' for n in range(1, 5)]

border_styles = [
    'solid',
    'dashed',
    'dotted',
    'double',
]

border_positions = [
    'top',
    'right',
    'bottom',
    'left',
]

number_of_combinations = len(fonts) * len(font_sizes) * len(border_colors) * len(border_widths) * len(border_styles) * len(border_positions)

print(f'Number of combinations: {number_of_combinations}')

styles = {}

for font in fonts:
    for font_size in font_sizes:
        for border_color in border_colors:
            for border_width in border_widths:
                for border_style in border_styles:
                    for border_position in border_positions:
                        selector = f'.{font}-{font_size}-{border_color.replace("#", "")}-{border_width}-{border_style}-{border_position}'
                        styles[selector] = f'''
font-family: {font};
font-size: {font_size};
border-{border_position}: {border_width} {border_style} {border_color};'''


template = '''
<!DOCTYPE html>
<html>
<head>
{head}
</head>
<body>
{body}
</body>
</html>
'''

benchmark_styles_styles = []
benchmark_styles_html = []

for selector, style in styles.items():
    benchmark_styles_styles.append(f'{selector} {{ {style} }}')
    benchmark_styles_html.append(f'<div class="{selector[1:]}">{selector[1:]}</div>')

style = "\n".join(benchmark_styles_styles)
benchmark_styles = template.format(
    head=f'<style>\n{style}\n</style>',
    body='\n'.join(benchmark_styles_html),
)

benchmark_x_styles_html = []

for selector, style in styles.items():
    benchmark_x_styles_html.append(f'<div x-style="{style}">{selector[1:]}</div>')

benchmark_x_styles = template.format(
    head=f'''
    <script>
      {x_style};
      xstyle("x-style");
    </script>''',
    body='\n'.join(benchmark_x_styles_html)
)

benchmark_x_styles_no_mutate = template.format(
    head=f'''
    <script>
      {x_style};
      xstyle("x-style", true);
    </script>''',
    body='\n'.join(benchmark_x_styles_html),
)

classes = {}
benchmark_classes_styles = []
benchmark_classes_html = []

for font in fonts:
    for font_size in font_sizes:
        for border_color in border_colors:
            for border_width in border_widths:
                for border_style in border_styles:
                    for border_position in border_positions:
                        classes['.font-' + font] = f'font-family: {font};'
                        classes['.font-size-' + font_size] = f'font-size: {font_size};'
                        classes[f'.border-{border_position}-{border_color.replace("#", "")}-{border_width}-{border_style}'] = f'border-{border_position}: {border_width} {border_style} {border_color};'
                        benchmark_classes_html.append(f'<div class="font-{font} font-size-{font_size} border-{border_position}-{border_color.replace("#", "")}-{border_width}-{border_style}">{font}-{font_size}-{border_color.replace("#", "")}-{border_width}-{border_style}-{border_position}</div>')

for selector, style in classes.items():
    benchmark_classes_styles.append(f'{selector} {{ {style} }}')

style = "\n".join(benchmark_classes_styles)
benchmark_classes = template.format(
    head=f'<style>{style}</style>\n',
    body='\n'.join(benchmark_classes_html),
)

print(f'Number of classes: {len(classes)}')

with open('benchmark-styles.html', 'w') as f:
    f.write(benchmark_styles)

with open('benchmark-x-styles.html', 'w') as f:
    f.write(benchmark_x_styles)

with open('benchmark-x-styles-no-mutate.html', 'w') as f:
    f.write(benchmark_x_styles_no_mutate)

with open('benchmark-classes.html', 'w') as f:
    f.write(benchmark_classes)
