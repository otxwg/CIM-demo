const path = require("path");
module.exports = {
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 8090, //修改服务端口号
  },
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve("src"),
      },
    },
    module: {
      rules: [
        {
          test: /\.md$/,
          use: [
            {
              loader: "vue-markdown-loader/lib/markdown-compiler",
            },
          ],
        },
      ],
    },
  },
};
