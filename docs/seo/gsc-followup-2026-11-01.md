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
- 规范页冲突：需新内容上线、代表页复测后重启验证；最终受理状态在发布后记录。
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
