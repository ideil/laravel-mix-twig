# Laravel Mix Twig

Laravel Mix extension that generates HTML from Twig templates.

## Installing

Install with npm:

```bash
npm i -D laravel-mix-twig
```

Tested on `laravel-mix@5.0.0`.

Base configuration of `webpack.mix.js` to make the extension work:

```js
const mix = require('laravel-mix');

require('laravel-mix-twig');

mix.twig();
```

By default it will search for Twig templates in `./resources/twig` directory that isn't prefixed with underscore `**/!(_)*.twig` and try to generate HTML output to `./html`.

## Options

You can configure extension with custom options as well.

| Key           | Type                  | Default               | Description |
|---------------|-----------------------|-----------------------|-------------|
| `enabled`     | `{Boolean}`           | `true`                | Determines whether HTML should be generated. |
| `root`        | `{String}`            | `'./resources/twig'`  | Path to root directory of Twig templates. |
| `entries`     | `{Array}`             | `['**/!(_)*.twig']`   | Match entries with `glob`. |
| `output`      | `{String}`            | `'./html'`            | Path to HTML output. |
| `data`        | `{String}`            | `'data/**/*.{y?(a\|)ml,json}'` | Path to YAML and/or JSON files in root directory. |
| `dataExtend`  | `{Object}`            | `{}`                  | Extend data manually. |
| `flatten`     | `{Boolean}`           | `false`               | When enabled, all HTML will be placed in the output folder without preserving the directory structure. |
| `loader` *    | `Object`              | `{}`                  | `twig-html-loader` [options](https://github.com/radiocity/twig-html-loader#options). |
| `html` *      | `Object`              | `{}`                  | `html-webpack-plugin` [options](https://github.com/jantimon/html-webpack-plugin#options). |
| `beautify`    | `{Boolean\|Object}`    | `false`               | `js-beautify` [options](https://github.com/beautify-web/js-beautify#js-beautifier). |

> \* marked options can had unexpected behavior. Please see example of advanced configurations below with explanations.

```js
mix.twig({
    enabled: !mix.inProduction(), // Enabled in development mode only
    root: './dev/templates', // Change default root path
    entries: ['index.twig', 'entries/*.twig'], // Custom entries
    output: './pub/templates', // Generate output HTML to this path
    data: '**/*.y?(a|)ml', // Search all `*.yml` and/or `*.yaml` files in root directory
    dataExtend: {
        ENV_IS_PRODUCTION: mix.inProduction(), // Add the environment variable
    },
    flatten: true, // Don't preserve the output directory structure
    loader: { // Custom `twig-html-loader` options
        data: {}, // * Gets automatically generated object from files of `data` option
    },
    html: { // Custom `html-webpack-plugin` options
        filename: {String}, // * Will be overwritten for each `entries`
        template: {String}, // * Depends on each path of the template from the root and its name
    },
    beautify: { // Custom `js-beautify` options
        'end_with_newline': true,
        'indent_inner_html': true,
        'preserve_newlines': false,
    },
});
```

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE.md) file for details.
