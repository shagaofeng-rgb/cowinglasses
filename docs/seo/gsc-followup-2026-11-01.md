# CoWin Glasses GSC 补充验收（2026-11-01）

本报告更新前一版中因浏览器故障而未完成的事项；历史报告保留当时状态，以本报告为最新结论。

## 已完成证据导出

- 8类共139条URL全部取得：替代页43、规范页冲突20、404共12、已抓取未收录9、重定向4、noindex共23、软404共2、已发现未收录26。
- 每条包含报告中的最近抓取日期；26条已发现未收录为GSC原始值N/A，没有自行编造时间。
- 20条规范页冲突逐条打开URL Inspection，取得User-declared canonical、Google-selected canonical与带时分秒的最后抓取时间。43条正确替代页提供当前HTTP声明的canonical及GSC分类证据，没有把分类推断伪装成逐条Inspection结果。
- 逐URL表：`gsc-url-dispositions-2026-11-01.csv`；63条规范页对照表：`gsc-canonical-comparison-2026-11-01.csv`。
- 全部139条公开HTTP复测无请求错误，原始机器证据与GSC页面文本在本地忽略目录 `output/gsc-2026-11-01/`。

## 原因及处置

| 范围 | 原因/证据 | 处置 |
|---|---|---|
| 20条canonical冲突中的3条账户、购物车、结账 | GSC旧抓取仍为index allowed；当前已noindex | 保留排除，等待重抓 |
| 其余17条canonical冲突 | 全部Google规范页选择另一语言同模板；帮助、分类、App、镜片指南内容曾大量复用英文 | How It Works、App、Lens Guide补齐六语正文/步骤/标题/描述；分类名与介绍本地化；Support已有六语正文保留并补齐本地化SEO标题；保留各语言自我canonical |
| 43条正确替代页 | 40条checkout参数URL、3条contact参数URL | 有意排除；保留业务参数，规范页合并；结账noindex |
| 23条noindex | 4条结账；19条退役demo商品 | 有意排除。旧demo渲染not-found/noindex，Next流式响应仍200；未宣称为HTTP404 |
| 12条404 | 10条旧无locale地址，2条无效字符路径 | 10条同内容308迁移已上线验证；`/$`及`/&`保留HTTP404 |
| 9条已抓取未收录 | 7条旧版本CSS/字体资源、2条结账参数页 | 保留排除；不屏蔽Google渲染所需静态资源 |
| 4条重定向 | HTTP/www/根首页默认语言入口 | 保留正常跳转，不为了“验证通过”取消归一化 |
| 2条软404 | 空购物车的日语checkout与空阿语分类 | noindex；空分类移出Sitemap；已提交验证 |
| 26条已发现未收录 | 18条News文章、4条空Blog列表、3条分类、1条镜片指南 | 真实News等待重抓；空Blog列表noindex并移出Sitemap，首次真实文章发布后自动恢复；第三方Blog发布逻辑未改变 |

上述计数按GSC分类互斥，不将排除总数139视为139个网站故障。旧版本静态资源不作为内容页索引是正常情况。

## Google验证状态

- Soft404：2026-11-01界面已确认 **Validation Started**，开始日期01/11/2026；截图 `output/gsc-2026-11-01/soft404-validation-started.jpg`。
- 规范页冲突：新内容上线且18个说明页复测后，已重启验证；界面确认 **Validation Started，Started 01/11/2026，Pending 20，Failed 0**。这不是最终验证通过。
- 404与正确替代页、正常redirect、noindex类别不要求归零；有意排除保留，旧Failed状态不能直接当成当前网站故障。
- Discovered验证原本Started于24/08/2026，不冒充本次新发起。

## 本批修改与测试

- `src/messages/learning.ts`：六语说明正文、步骤、权限说明与分类标题。
- `src/components/commerce/route-page.tsx`：复用字典显示学习页/分类页，保留响应式布局；RTL图标使用逻辑间距。
- `src/app/[locale]/[...segments]/page.tsx`：页面标题和说明采用对应语言。
- `src/app/[locale]/blog/page.tsx`、`src/app/sitemap.ts`：空Blog列表的robots与Sitemap资格一致，有内容自动恢复。
- `src/lib/seo/indexability.test.ts`：完整六语正文及分类键回归测试。
- `scripts/gsc-evidence-audit.mjs`：根据公开GSC导出URL复测响应与canonical，不读取浏览器凭据。

不改变News停用状态、第三方Blog发布程序、支付、客户数据与Google周一定时配置。

## 最终发布验收

- 修复提交 `03f9e23` 已推送main；Vercel production `dpl_Ai1awRDC1YeRE5q13xrMj1GTyuYF` 为READY，cowinglasses.com与www正式域名绑定成功。
- 本地完整build、TypeScript、Lint、16项测试均通过；Vercel生产构建成功。
- 六语言共18个说明页逐一HTTP200，本地化H1/标题与自我canonical全部一致。阿拉伯语手机390px及日语桌面1440px均无整页横向溢出；手机dir=rtl。
- Sitemap排除18个空商品分类及6个空Blog列表，当前161条。最终检查161个Sitemap URL及其内链/hreflang共409地址，一致性问题0。
- 重新提交Sitemap后，GSC显示 **Sitemap submitted successfully**；表格Submitted与Last read均为1 Nov 2026，Status Success，Discovered pages 161。
- Google验证证据：`output/gsc-2026-11-01/canonical-validation-started.jpg`、`soft404-validation-started.jpg`、`sitemap-submitted-success.jpg`。截图与原始账户UI只留本地，不提交仓库。
- 逐URL处置表及63条canonical对照已经完整交付；对43条正确替代页，Google分类是正确canonical的证据，表格中的目标为当前HTTP声明，未伪造逐条Google Inspection字段。
- 10个旧地址的308迁移及两个无效字符URL的404保留。Google重抓与最终验证结果需后续报告更新，不能承诺收录或排名。
