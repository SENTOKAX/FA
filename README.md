### Feed App 

#### 环境要求
- node版本 16.15.0  
- mongoDB  6.0.0
- 微信开发者工具 https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html  
#### 运行
##### feed-server

- 修改配置文件

在项目根目录下，根据`.env.template`模板文件创建`.env`

```
// 参数说明
PORT=项目运行端口
MONGO_URL=mongodb连接地址

APP_ID=测试号app id
APP_SECRET=测试号app secret

OSS_ACCESS_KEY_ID=oss access key
OSS_ACCESS_KEY_SECRET=oss access secret
OSS_HOST=oss服务地址
OSS_BUCKET=oss存放文件bucket
```

- 安装依赖

```
npm i 
```

- 启动

```
npm start
```

##### feed-front

- 安装依赖
 ```
 npm i
 ```

- 启动

 ```
npm start
 ```

- 登录微信开发者工具

- 关注测试号
![](./%E6%B5%8B%E8%AF%95%E5%8F%B7.jpg)

- 在微信开发者工具中进入公众号网页项目，在地址栏输入 http://127.0.0.1:3000 进行授权登陆

- 在浏览器端打开 http://127.0.0.1:3000 , 将cookie从开发者工具中拷贝到浏览器中使用
