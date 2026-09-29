# WING project page

项目主页：https://mikuz12.github.io/wing/

维护仓库：https://github.com/MIKUZ12/wing

纯静态论文主页，使用 HTML、CSS 和少量 JavaScript，可直接部署到 GitHub Pages，无需 npm 或构建工具。

## 本地预览

在本目录运行 `python3 -m http.server 8081 --bind 127.0.0.1`，打开 http://127.0.0.1:8081/ 。如果已有服务器运行，直接刷新页面即可。

## 文件维护

- `index.html`：标题、作者、机构、摘要、链接和论文中的结果。
- `wing_logo.png`：标题前的透明 PNG 标志，发布时一并上传。
- `teaser.pdf` / `assets/teaser.png`：At a Glance 图，点击可查看原始 PDF。
- `assets/wing-end-frame.png`：此前提取的无损静帧备份；当前循环播放模式不使用。
- `assets/fonts/`：本地托管的 Source Serif 4 正文字体及 OFL 许可。
- `styles.css`：视频遮罩、字体、排版和手机适配。
- `script.js`：背景视频持续循环，支持播放/暂停，尊重系统减少动态效果设置；同时维护章节导航、结果图交互、视频卡片及方法动画。
- `assets/wing-cover-4k.mp4`：当前首页视频，来自更新后的 `wing_demo.mov`，保留 4K / 30 fps，H.264 CRF 17，无声循环播放；旧 `assets/wing-demo-4k.mp4` 不再引用。
- `assets/wing-cover-poster.jpg`：当前首页视频尚未播放时的封面。
- `main.pdf`：论文下载文件。
- `wing_demo.MOV`：原始素材，已加入 `.gitignore`，不必上传。

顶栏固定显示 Paper（当前 PDF）、Code（Coming soon）和 BibTeX，并随滚动更新章节名称。BibTeX 暂按 Manuscript 提供，未填写尚未确认的年份、arXiv 编号或发表信息；确认后再补充。

## GitHub Pages 发布

网址由 GitHub 用户或组织名称决定，不能仅通过仓库名字随意指定：

- `https://wing.github.io/`：需要拥有 `wing` 用户或组织，并在其中建立名为 `wing.github.io` 的仓库。
- `https://YOUR_NAME.github.io/wing/`：在自己的账号中建立 `wing` 仓库。
- `https://YOUR_ORG.github.io/`：创建可用的项目组织，并建立 `YOUR_ORG.github.io` 仓库。

1. 确定账号/组织，创建对应的 GitHub 仓库。
2. 上传 `index.html`、`styles.css`、`script.js`、`assets/`、`wing_logo.png`、`teaser.pdf`、`main.pdf`、`.nojekyll`、`.gitignore` 和本说明。
3. 在仓库 **Settings → Pages → Build and deployment** 选择 **Deploy from a branch**，分支选 `main`，目录选 `/ (root)`，保存。
4. 等待 GitHub Pages 部署完成，使用设置页给出的网址。

所有素材链接均为相对路径，同时兼容根域名主页和 `/wing/` 子路径。后续直接修改仓库文件并提交，Pages 会自动更新。

本目录使用独立 Git 仓库。请始终在 `wing_web` 目录内提交和推送，避免操作上层 WAM 仓库。

参考：https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

视觉布局参考 RISE 项目主页 https://opendrivelab.com/RISE/ ，页面代码独立实现，视频和文字来自本项目素材。

## At a Glance 对比图

三列均使用 0–100% 的成功率刻度；WING 位于第一行。悬停、键盘聚焦或触摸柱条会显示分项成绩，并联动高亮同名方法。没有表格展开模块。

- LIBERO：WING 99.20，Fast-WAM 97.60，π0.5 96.90，LingBot-VA 98.50（论文 Table 2a）。
- RoboTwin 2.0：WING 93.80，Fast-WAM 91.83，π0.5 79.75（论文 Table 2b）；LingBot-VA 2.0 93.60，Clean 93.80、Randomized 93.40（用户提供截图，替代旧版 LingBot-VA）。
- RoboCasa–GR1：WING 57.7，GR00T-N1.6 47.6，Fast-WAM 51.9，LDA-1B 55.4（论文 Table 1）。Fast-WAM 是本文复现结果。

图中 `pp` 表示百分点，提升相对本图所列最强基线计算。所有分项、来源和提示内容位于 `index.html` 的 `data-benchmark-detail` 属性中。

## At a Glance 视频卡片

独立 Demo 章节已合并至 At a Glance。四个任务卡片可横向滚动，也可通过左右箭头切换；点击打开带原生播放控件的弹窗，Esc、关闭按钮或点击弹窗外部可关闭。

- 源视频放在 `demos/`，原文件不改动且已加入 `.gitignore`。
- 页面使用 `assets/demos/` 下的 H.264 MP4，保留 3840×2160 分辨率及 30000/1001 fps，移除音轨，启用 faststart。常规视频使用 CRF 17；Battery Assembly 使用同样的 CRF、额外设置 12 Mbps 最大码率 / 24 Mbps 缓冲，以使单个文件适合 GitHub 托管。
- JPG 仅用于视频加载前的封面，放大播放使用同一个 4K 视频文件。
- 预览进入可见区域后静音播放一次，离开可见区域或打开弹窗时暂停；支持 Pause previews 开关及系统减少动态效果设置。
- 视频标题、路径位于 `index.html` 的 `.demo-card` 中。

## Methodology of WING

At a Glance 后的独立方法章节，包含与 teaser 相同的浅色渐变边框和方法动画。顶栏可跳转到 Methodology。说明依据论文第 3 节，涵盖交互与相机运动分离、DCT 低频提取、推理时引导预测，以及人类视频预训练和机器人适配。

`method_animation/main.mov` 为原始动画；页面播放 `assets/method/wing-method.mp4`。转换保留 1020×482，使用 H.264 CRF 16，并将时间戳放慢 1.5 倍、输出 30 fps，约 18 秒延长至 27.03 秒。视频滚动进入视口即自动静音播放，离开视口暂停，再次进入时继续或重播。隐藏原生播放器控制条，框下保留轻量暂停/重播按钮。

## 更新线上页面

修改后在本目录执行：

```sh
git add index.html styles.css script.js assets README.md .gitignore
git commit -m "Update project page"
git push origin main
```

若更换论文或 teaser，另将相应 PDF 加入提交。Pages 从 `main` 分支根目录自动发布。
