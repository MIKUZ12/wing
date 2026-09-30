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

三列均使用 0–100% 的成功率刻度；WING 位于第一行。悬停、键盘聚焦或触摸柱条会显示分项成绩，并仅高亮当前柱条。没有表格展开模块。

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

当前方法动画来自 `method_animation/out/wing-method.mp4`，直接复制为 `assets/method/wing-method.mp4`，未再次转码或缩放，保留 1920×1080 / 30 fps / 40 秒。视频框居中，最大宽度 840px，保持 16:9。视频滚动进入视口即自动静音播放，离开视口暂停，再次进入时继续或重播；框下保留轻量暂停/重播按钮。

## 更新线上页面

修改后在本目录执行：

```sh
git add index.html styles.css script.js assets README.md .gitignore
git commit -m "Update project page"
git push origin main
```

若更换论文或 teaser，另将相应 PDF 加入提交。Pages 从 `main` 分支根目录自动发布。

## Motivation 1 / WING-LAM

方法总览动画下按头部运动问题、两段 egocentric 示例、编码与迁移问题、WING-LAM 解决方法展开。WING-LAM 图来自 `assets/wing-lam.pdf`，按 CropBox 导出为 `assets/method/wing-lam.png`，点击可查看原 PDF。正文按论文第 3.2 节介绍几何运动分离、双分支教师和 RGB 学生蒸馏。

`assets/ego_video1.mp4` 原片超过 GitHub 单文件限制，仅保留本地；网页使用 `assets/method/ego-head-motion-1.mp4`，保留 1920×1080 和原时间轴，H.264 CRF 17，最大码率 9 Mbps / 缓冲 18 Mbps。`assets/ego_video2.mp4` 直接使用原始 320×180 文件，未转码。示例进入视口自动静音播放，离开暂停；可通过各自的按钮暂停或重播。

## 阅读目录

正文采用左侧粘性分层目录，包含 At a Glance、Methodology（Motivation 1、WING-LAM、Motivation 2、Spectral guidance）、Abstract、BibTeX。滚动时只标记当前子章节；移动端折叠为 On this page。封面布局独立保持全宽。WING-LAM 图框最大宽度与正文一致，均为 960px。

## Motivation 2 / Spectral guidance

WING-LAM 后继续介绍 ego–robot 的操作节奏与时序差异，以及频域解决方案。内容依据论文第 3.3 节：沿时间维做 DCT，保留最低 K 个频率系数作为 guidance target；推理时从当前上下文预测 guidance，再通过 gated attention 引导动作生成。强调截断作用于 latent guidance，而非直接滤波机器人动作。流程图仅说明训练目标的构建流程，不是实验数据图。

### What WING does

The four-question experiment section uses native HTML/CSS charts, with data in
`experiments.js` transcribed from `main.pdf` (Tables 1–3, Figures 3–5, and Table 12).
Three side-by-side native tables expose all main simulation table columns; a two-row grouped chart shows all four real-world tasks under
standard/generalization settings with success and progress metrics. Selectors expose module and
DCT-bandwidth ablations, and six equal-budget pretraining strategies. Generalization
uses the precise Table 12 averages rather than the rounded Figure 4 labels.
Axes start at zero. No uncertainty/error bars are invented. The existing At a
Glance comparison remains separate (including the user-supplied LingBot-VA 2.0 result).

Q1 is a two-by-two grid corresponding to all four Figure 3 panels. Camera
sensitivity means and standard deviations come directly from the local source
`../graph/camera_sensitivity_with_std.py`. The motion-decoding panel preserves
qualitative relative positions from Figure 3(a), whose axes do not label absolute
R² coordinates; the web panel exposes no invented numeric values and uses a descriptive caption. Replace its schematic coordinates when original data is supplied.
All reading sections and chart/figure containers are constrained to the same
960px text width; paired charts stack on narrow screens.

The DCT bandwidth ablation uses four fixed LIBERO suite charts in a centered
2×2 grid capped at 840px (narrower than the 960px text column). The spectral
method illustration advances every two seconds while visible and playing.

The component ablation is a four-row native table grouped into Components, LIBERO,
and Real-world columns. It reuses all 24 Table 3 values, bolds column maxima
(including ties), and highlights the complete configuration. Its 900px cap keeps
it slightly narrower than the text column. The takeaway compares both components
against neither: +7.5 pp standard, +9.0 pp generalization, without ego pretraining.

Pretraining is displayed as one horizontal-bar comparison with six settings in a
3×2 layout. Shared strategy rows align across each band; all 36 Figure 5(b) values
are visible without a selector. WING uses blue, its no-debiasing variant light blue,
and other strategies gray. LIBERO uses labeled, truncated axes: Spatial 90–100%, Object 95–100%, Goal
90–100%, Long 80–100%. Real-world Standard uses 55–80% and Generalization uses 25–55%. Bar lengths are
normalized within each panel; all original values remain visible.
