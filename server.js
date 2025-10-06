const express = require('express');
const cors = require('cors');
const path = require('path');
const tencentcloud = require("tencentcloud-sdk-nodejs");

// 在Zeabur部署时，我们会通过环境变量来设置密钥，所以代码里保留占位符即可
const SECRET_ID = "YOUR_SECRET_ID"; 
const SECRET_KEY = "YOUR_SECRET_KEY";

const AiartClient = tencentcloud.aiart.v20221229.Client;

const client = new AiartClient({
    credential: {
        // Zeabur会自动从环境变量读取
        secretId: process.env.SECRET_ID || SECRET_ID,
        secretKey: process.env.SECRET_KEY || SECRET_KEY,
    },
    region: "ap-guangzhou",
    profile: {
        httpProfile: {
            endpoint: "aiart.tencentcloudapi.com",
        },
    },
});

const app = express();
// Zeabur 会通过环境变量 PORT 告诉我们应该监听哪个端口
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 托管前端静态文件
app.use(express.static(__dirname)); 

// 后端API接口
app.post('/generate-image', async (req, res) => {
    const { prompt, style } = req.body;
    console.log("收到生成请求, Prompt:", prompt);
    
    const params = { "Prompt": prompt, "RspImgType": "base64", "Resolution": "1024:1024" };
    if (style) {
        params.Style = style;
    }

    try {
        const response = await client.TextToImageRapid(params);
        console.log("成功从腾讯云获取图片");
        res.json({ image: response.ResultImage });
    } catch (err) {
        console.error("腾讯云API调用失败:", err.message);
        res.status(500).json({ error: `API 调用失败: ${err.message}` });
    }
});

app.listen(port, () => {
    console.log(`服务器已启动，正在监听端口 ${port}`);
});