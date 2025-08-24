# 手动部署指南

由于API Token权限问题，请按照以下步骤手动部署：

## 方法一：使用wrangler login（推荐）

1. **运行登录命令**:
   ```bash
   npx wrangler login
   ```

2. **按提示访问链接**:
   - 系统会显示一个OAuth链接
   - 在浏览器中打开该链接
   - 授权你的Cloudflare账户

3. **部署**:
   ```bash
   npx wrangler deploy
   ```

## 方法二：创建新的API Token

1. **创建API Token**:
   - 访问: https://dash.cloudflare.com/profile/api-tokens
   - 点击 "Create Token"
   - 选择 "Custom token"
   - 设置权限:
     - Account: Read
     - Cloudflare Workers: Edit
     - D1: Edit

2. **设置环境变量并部署**:
   ```bash
   export CLOUDFLARE_API_TOKEN=你的新token
   npx wrangler deploy
   ```

## 方法三：使用Cloudflare Dashboard

1. **登录Cloudflare Dashboard**
2. **进入Workers & Pages**
3. **创建新Worker**
4. **上传代码**
5. **绑定D1数据库**

## 验证部署

部署成功后，访问：
```
https://personasset.dickwin2003.workers.dev
```

## 测试删除功能

1. 打开部署的网址
2. 添加一个测试资产
3. 点击删除按钮验证修复成功

当前代码已完全准备就绪，只需完成认证即可部署！