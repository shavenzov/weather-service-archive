const srcDir = "src";
const distDir = "dist";

const webpack = require( "webpack" );
const path = require( "path" ); 
const HTMLWebpackPlugin = require( "html-webpack-plugin" );
const MiniCssExtractPlugin = require( "mini-css-extract-plugin" );
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
 
 const isDevMode = env.mode === "development";   

 return {
    mode: env.mode,
    entry: `./${srcDir}/index.js`,
    output: {
        path: path.resolve(__dirname, distDir),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ isDevMode ? "style-loader" : MiniCssExtractPlugin.loader,
                       "css-loader",
                        "postcss-loader" ]
            },
            {
                test: /\.worker\.js$/,
                use: { loader: 'worker-loader' }
            },
            {
                loader: "babel-loader",

                include: [
                  path.resolve(__dirname, srcDir),
                ],
          
                test: /\.js$/,
          
                // Options to configure babel with
                query: {
                  plugins: ['@babel/plugin-transform-runtime'],
                  presets: ['@babel/preset-env'],
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: `${srcDir}/data`, to: `data` }
          ] ),
        new HTMLWebpackPlugin( 
            {
                template: `./${srcDir}/index.html`
            }
        ),
        new MiniCssExtractPlugin(),
        new webpack.ProgressPlugin()
    ]
 }
}