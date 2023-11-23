const path = require('path');

module.exports = {
  entry: './src/public/views/js/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'src', 'public', 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
