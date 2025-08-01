<div align="center">
  
# 📈 聚财 Converasset

<strong>私人资产管理助手 —— 告别每天记零散流水账，资产数据自己掌握</strong>

[![GitHub Stars](https://img.shields.io/github/stars/nbzz/converasset?style=flat-square&logo=github&color=yellow)](https://github.com/nbzz/converasset/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/nbzz/converasset?style=flat-square&logo=github&color=blue)](https://github.com/nbzz/converasset/network/members)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-部署-4285F4?style=flat-square&logo=github&logoColor=white)](https://nbzz.github.io/converasset)
</div>

> 本项目以轻量，无后端数据库为目标
> 
> 如有任何问题或建议，欢迎关注公众号：折腾结果发私信 或提交issues。

## 🖼️ 项目截图

<div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
  <img src="https://github.com/user-attachments/assets/72252a36-c3d0-46b1-a965-06aa08ee9b81" alt="记录页面" style="width: 29%; margin-bottom: 10px;">
  <img src="https://github.com/user-attachments/assets/86d3c87f-e9bb-494b-bdbb-7d5ba1d392bc" alt="总览页面" style="width: 35%; margin-bottom: 10px;">
  <img src="https://github.com/user-attachments/assets/27ce6f32-4cf5-4789-b154-9b6bf83ed3d4" alt="设置页面" style="width: 29%; margin-bottom: 10px;">
</div>

## ✨ 功能特点

- **资产金额记录**：专门针对房产、股票、银行、基金、互联网账户、负债等资产金额的聚合管理
- **多维度资产分析**：提供趋势图、环形图、堆叠图等多种图表动态BI展示资产情况
- **多维度账户管理**：速记页支持增删改、拖拽排序、自定义各类资产账户及其历史记录
- **灵活单位设置**：支持元、千、万、十万、百万、千万、亿元等多种金额单位显示，为小微和庞大账户提供便利
- **数据导入/导出**：支持以JSON、剪贴板数据类型的导入和导出，便于备份和迁移
- **离线使用支持**：通过Service Worker支持离线访问
- **响应式设计**：适配各种设备屏幕尺寸
- **PWA支持**：可以安装为桌面应用，提供类似原生应用的体验

## 💻 部署与开发

### github pages快速部署
1. Github Fork
2. 你的仓库 Setting —— Pages 
3. Build and deployment ，Deploy from a branch
4. main，root
5. 我的Github Pages页面：[聚财 Converasset](https://nbzz.github.io/converasset/)

### EDGEONE 快速部署
1. Github Fork
2. 登录[EDGEONE](https://edgeone.ai/products/pages)
3. 一键部署 [![Deploy with EdgeOne Pages](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?from=github&template=https://github.com/nbzz/converasset&from=github)

### 本地使用
1. 克隆本项目到本地
2. 直接在浏览器中打开 `index.html` 文件即可开始使用

### 本地开发
克隆项目到本地，直接开发：
   ```bash
   git clone https://github.com/nbzz/converasset.git
   cd converasset
   ```

### 部署到服务器
1. 将整个项目文件夹上传到服务器
2. 配置Web服务器指向项目根目录
3. 确保服务器支持静态文件服务

## 🙋‍♂️ 使用方法

1. 在"速记"页输入各资产账户数值（允许负值）
2. 点击"保存"按钮保存数据到浏览器缓存，请定期导出备份，保护自己日积月累的资产数据
3. 切换到"总览"页面查看资产趋势图表和分布情况
4. "设置"页面有各类贴心功能
   
## 💽 数据存储

所有数据都存储在浏览器的localStorage中，不会上传到任何服务器。导出的数据为JSON文件或剪贴板中，请用户自行备份或在不同设备间同步。
> 我用微信输入法的多端剪贴板在PC和手机做同步

## ⌨ 快捷键

- `Ctrl+S` / `Cmd+S`：保存数据到缓存
- `Enter`：在金额输入框间快速切换

## 📲 技术栈

- HTML5
- Tailwind CSS
- Chart.js（图表绘制）
- Font Awesome（图标）
- localStorage（数据存储）
- Service Worker（PWA支持）
- Git（版本控制）

## 📄 版本控制

该项目使用Git进行版本控制。您可以使用以下命令查看历史变更：

```bash
git log --oneline
```

## ✈ 开发计划

- [x] 基础资产记录功能
- [x] 资产趋势可视化
- [x] 数据导入/导出
- [x] 历史记录编辑
- [x] 多维度图表分析
- [x] 账户筛选功能
- [x] 性能优化（大数据处理）
- [x] Git版本控制
- [x] 设置页小数点设置无效
- [x] 设置页备注设置无效，应该改成每一个账户的备注，对应json
- [x] 设置页删除账户旁边多一个隐藏显示账户的开关，对应总览页
- [x] 设置页需要有账户编辑名称的功能
- [x] 资产备注在总览页显示
- [ ] 资产（年化）收益率分析

## ❤️ 贡献

欢迎提交Issue和Pull Request来帮助改进这个项目。在提交代码前，请确保：

1. 遵循现有的代码风格
2. 添加适当的注释
3. 测试您的更改

## 🔑 许可证

本项目采用GNU通用公共许可证第3版（GPLv3），详情请见 [LICENSE](LICENSE) 文件。

## 📞 交流与赞助
> 收到的赞助是我开发的动力

<div align="center">
如有任何问题或建议，欢迎关注下方公众号发私信或提交issues。

|公众号关注 |微信赞助 | 支付宝赞助 |
|:---:|:---:|:---:| 
| <img width="270" alt="image" src="https://github.com/user-attachments/assets/9b6fd867-4cfa-4da3-9f9f-56867660d685" title="公众号 折腾结果"/> | <img width="100" alt="image" src="https://github.com/user-attachments/assets/0bdfa9f1-9853-4811-a8db-4b767b45bbc6" title="微信支付"/> |<img width="100" alt="image" src="https://github.com/user-attachments/assets/6de777d6-d4d2-4fa5-90a6-6465b6efdd22" title="支付宝"/> |

</div>
