//# Laravel Mix Twig
//

const
    NAME = 'twig',
    DEPENDENCIES = ['glob', 'fs-extra', 'js-yaml', 'html-webpack-plugin', 'raw-loader', 'twig-html-loader', 'js-beautify'],
    mix = require('laravel-mix');

let glob, path, fse, yaml, HtmlWebpackPlugin;

class TwigBeautify {
    constructor(config) {
        this.config = config;
        this.beautify = require('js-beautify').html;
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(NAME, (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                NAME,
                (data, cb) => {
                    data.html = this.beautify(data.html, this.config);

                    cb(null, data);
                }
            );
        });
    }
}

class Twig {
    name() {
        return [NAME];
    }

    dependencies() {
        return DEPENDENCIES;
    }

    boot() {
        glob = require('glob');
        path = require('path'),
        fse = require('fs-extra');
        yaml = require('js-yaml');
        HtmlWebpackPlugin = require('html-webpack-plugin');
    }

    register(config = {}) {
        this.config = Object.assign({
            enabled: true,
            dir: __dirname.split('node_modules')[0],
            root: './resources/twig',
            entries: ['**/!(_)*.twig'],
            output: './html',
            data: 'data/**/*.{y?(a|)ml,json}',
            dataExtend: {},
            flatten: false,
            replaceOutputPath: '',
            loader: {},
            html: {},
            beautify: false,
        }, config);
    }

    webpackRules() {
        if (!this.config.enabled) return;

        const
            getData = (context) => {
                let
                    Paths = glob.sync(path.join(this.config.root, this.config.data)),
                    Merged = {};

                Paths.forEach(filePath => {
                    const
                        Content = /y(?:a|)ml/.test(path.extname(filePath)) ?
                            yaml.safeLoad(fse.readFileSync(filePath, 'utf8')) :
                            context.fs.readJsonSync(filePath, { throws: false });

                    Object.assign(Merged, Content);
                });

                Object.assign(Merged, this.config.dataExtend);

                return {
                    paths: Paths,
                    merged: Merged,
                };
            };

        this.config.loader.data = (context) => {
            const
                Data = getData(context);

            Data.paths.forEach(dataPath => {
                // Force webpack to watch file
                context.addDependency(path.join(this.config.dir, dataPath));
            });

            return Data.merged || {};
        };

        return {
            test: /\.twig$/,
            use: [
                'raw-loader',
                {
                    loader: 'twig-html-loader',
                    options: this.config.loader,
                },
            ],
        };
    }

    webpackPlugins() {
        if (!this.config.enabled) return;

        let
            fileExt = '.html',
            Plugins = [];

        const
            addPlugin = body => {
                Plugins = body ? Plugins.concat(body) : Plugins;
            },
            makeHtmlConfig = () => {
                let
                    Entries = [],
                    HtmlEntriesConfig = [];

                this.config.entries.forEach(pattern => {
                    const
                        entryPaths =
                            glob.sync(path.join(this.config.root, pattern));

                    Entries = Entries.concat(entryPaths);
                });

                Entries.forEach(entry => {
                    let
                        filePath = this.config.flatten ?
                            path.parse(entry).name + fileExt :
                            entry
                                .replace(this.config.root, '')
                                .replace(path.extname(entry), fileExt);

                    if (this.config.replaceOutputPath.length) {
                        filePath = filePath.replace(this.config.replaceOutputPath, '');
                    }

                    HtmlEntriesConfig.push({
                        ...this.config.html,
                        template: entry,
                        filename: path.join(this.config.output, filePath),
                    });
                });

                return HtmlEntriesConfig;
            },
            HtmlBeautify =
                this.config.beautify ?
                    new TwigBeautify(this.config.beautify) :
                    false;

        [
            makeHtmlConfig().map(config => new HtmlWebpackPlugin(config)),
            HtmlBeautify
        ].forEach(Plugin => {
            addPlugin(Plugin);
        });

        return Plugins;
    }
}

mix.extend('twig', new Twig());
