## Release notes
### v0.1.3
1. 移除jquery, 改用原生js, 防止加载失败
2. 优化错误处理, 减少插件报错
3. 添加右侧面板关闭按钮
4. 放宽xhr请求的判断, 包含content-type为application/json的请求


## 安装说明
1. 进入chrome扩展程序页面 [chrome://extensions/](chrome://extensions/)
2. 勾选开发者模式
3. 点击左上角加载已解压的扩展程序
4. 选择解压后的showProxyTarget文件夹, 注意该文件夹不能删除

## 使用说明
1. F12中最后面会加一个 "ProxyTarget" 的标签, 可以点击它按住鼠标拖动将其移至前面
2. 在ProxyTarget面板会显示XHR请求, 点击对应请求的Name即可看到请求详情
3. 右侧tab说明:
    -   headers 是头部信息
    -   Preview 是json格式响应值
    -   Response 是json格式文本响应值
    -   QueryString 是get请求参数
    -   PostData 是post请求体