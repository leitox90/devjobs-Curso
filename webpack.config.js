//Este codigo me va a permitir seleccionar las Skills del programador
//Tengo que instalar babel-loader
const path = require("path")
const webpack = require("webpack")

module.exports = {
    entry: './public/js/app.js',//Tengo que crear este app.js  
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, "./public/dist")
    },
    module: {
        rules: [    
          {
            test: /\.m?js$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
    }
}