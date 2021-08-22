# Node.js-Google-oauth-2.0

## 安裝套件
```
npm install express
npm install nodemailer
npm install jsonwebtoken
npm install axios
npm install cors
npm install querystring
npm install cookie-parser
```
## Config

## **檔案名稱：config.json**
GOOGLE_CLIENT_ID 跟 GOOGLE_CLIENT_SECRET 自行設定
```json
{
    "Google": {
        "GOOGLE_CLIENT_ID": "",
        "GOOGLE_CLIENT_SECRET": "",
        "SERVER_ROOT_URI": "http://localhost:4000",
        "UI_ROOT_URI": "http://localhost:3000",
        "JWT_SECRET": "shhhhh",
        "COOKIE_NAME": "auth_token"
    }
}
```
## 執行

```
node index.js
```