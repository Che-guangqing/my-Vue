import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
    input: './src/index.js',  //打包的入口文件
    output: {
        file: 'dist/umd/vue.js',  //出口路径
        name: 'Vue',     //指定打包后全局变量的名字
        format: 'umd',   //统一模块规范
        sourcemap: true, //es6 -> es5 开启源码调试
    },
    plugins: [
        babel({
            exclude: "node_modules/**", //忽略文件
        }),
        process.env.ENV === 'development' ? serve({
            // 开发模式时才起服务
            open: true,
            openPage: '/public/index.html', // 默认打开html路径
            port: 3000,
            contentBase: '' // 以当前文件夹路径启动服务
        }) : null
    ]
}