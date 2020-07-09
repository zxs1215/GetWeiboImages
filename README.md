# GetWeiboImages
微博爬虫，爬取特定用户的所有图片

使用说明
=======

1. 保证网络通畅，能登录微博(weibo.com)。

2. 安装运行环境
    - 安装 .net framework 4.5
    - 安装node.js,然后在代码目录执行： 
    - npm install puppeteer  (由于墙的问题可以考虑用安装cnpm)
3. 修改代码中的用户名密码
4. 执行程序
    - 输入node example.js + 微博用户id（注意是id不是用户名）。
    - 怎么找id呢？点他相册看原图，url里在weibo.com后面跟着的数字就是id。
    - 如 node example.js 1195354434 即可下载林俊杰的相册图片。
    - 执行完成后打开的浏览器会自行关闭，然后在images目录中即可看到下好的图片。
5. 注意事项
    - 有可能存在网络问题或新浪抽风等原因发生图片加载不出来的情况，导致图片无法获取，这个时候可以试试重新执行程序。
    - 图片越多，下载时间越长，请耐心等待。
    
    
6.效果演示
    - https://www.bilibili.com/video/BV1Zt411T7fV/

