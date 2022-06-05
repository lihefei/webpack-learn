const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 模板插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 将css抽出成独立文件
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin'); //压缩css
// const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin'); //压缩js
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 自动清理dist目录

module.exports = (env, argv) => {
    const config = {
        mode: 'production', // 生产模式
        entry: path.resolve(__dirname, './src/main.js'), // 入口文件
        output: {
            path: path.resolve(__dirname, './dist'), // 打包输出的目录
            filename: 'js/bundle-[chunkhash:8].js', // 打包输出的文件名
        },
        module: {
            rules: [
                // {
                //     test: /\.html$/,
                //     use: 'html-loader',
                // },
                {
                    test: /\.css$/,
                    use: [
                        //'style-loader',
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: '../', // css 引入的资源路径前面拼上../
                            },
                        },
                        'css-loader',
                        'postcss-loader',
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                name: '[name]-[contenthash:10].[ext]',
                                outputPath: 'img',
                                limit: 10 * 1024, // 表示 小于10k 的图片会被 base64 编码
                                fallback: 'file-loader', // 大于 10k 的图片由 file-loader 处理，默认值，可不设置
                                esModule: false, // 关闭es6语法规范，处理打包背景图不显示的问题
                            },
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                disabled: true, // 在开发或使用webpack-dev-server时，使用它可以加快初始编译速度，并在较小程度上加快后续编译速度（来自官方文档）
                            },
                        },
                    ],
                    type: 'javascript/auto', // 处理打包背景图不显示的问题
                },
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        // 也可以在项目根目录新建 .babelrc 文件，将配置写入文件中
                        options: {
                            presets: ['@babel/preset-env'], // 把es6转换为es5的模块
                            cacheDirectory: true, // 开启babel 缓存，未修改的 js 文件直接取缓存
                            // plugins: [
                            //    '@babel/plugin-proposal-class-properties', // class语法
                            //     '@babel/plugin-proposal-decorators', // 装饰器
                            // ],
                        },
                    },
                    include: path.resolve(__dirname, 'src'), // 只处理src目录下的文件
                    exclude: /node_modules/, // 不处理 node_modules 中的文件
                },
                // {
                //     exclude: /\.(css|js|html|less|scss|jpg|png|gif|ttf|woff2?|eot)$/,
                //     use: [
                //         {
                //             loader: 'file-loader',
                //             options: {
                //                 name: '[hash:8].[ext]',
                //                 outputPath: 'media',
                //             },
                //             type: 'javascript/auto',
                //         },
                //     ],
                // },

                { test: /\.ts$/, use: 'ts-loader' },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html', // 模板
                title: 'hello webpack', // 设置 html 的 title，可以在 html 中通过 ejs 语法引入
                filename: 'index.html', // 打包后的文件名
                inject: true, // 默认值，script标签位于 head 底部，可选值 body、header、false(表示不自动引入js)
                minify: {
                    collapseWhitespace: true, // 去除空格
                    minifyCSS: true, // 压缩 html 内联的css
                    minifyJS: true, // 压缩 html 内联的js
                    removeComments: true, // 移除注释
                },
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name]-[contenthash:8].css',
            }),
            new CleanWebpackPlugin(),
        ],
        optimization: {
            minimizer: [
                // new UglifyjsWebpackPlugin({
                //     cache: true, // 是否使用缓存
                //     parallel: true, // 是否是并发打包，可以同时打多个
                //     sourceMap: true, // 压缩完js，ES6变为ES6，需要一个源码映射
                // }),
                new CssMinimizerWebpackPlugin(),
            ], // 优化项
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'), // 设置别名
            },
            extensions: ['.js', '.json', '.vue'], // 引入 js、json、vue 文件时不需要写后缀名
        },
        devServer: {
            static: path.join(__dirname, 'dist'), // 服务器web静态目录
            host: 'localhost', // 主机地址
            port: 9000, // 端口
            hot: true, // 热更新
            compress: true, // 开启gzip压缩
            open: true, // 初次打包完自动打开浏览器
        },
    };

    console.log(env.development);

    // 开发模式
    if (env.development) {
        config.mode = 'development';
        config.devtool = 'eval-source-map'; // 生成源码映射方便调试
    }

    return config;
};
