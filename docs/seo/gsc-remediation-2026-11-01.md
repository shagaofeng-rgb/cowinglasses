# cowinglasses.com GSC 索引处置（2026-11-01）

> 本文件保留第一批排查时的历史状态。浏览器恢复后的139条完整明细、20条Google规范页对照与最新验证结果见 [补充验收](./gsc-followup-2026-11-01.md)。

## 证据与完成边界

已在用户登录的 GSC 读取域资源：报告最后更新2026-10-23，254已收录、139未收录。139是排除总数，不是故障总数。404旧验证开始2026-08-24、失败2026-09-05，不能作为本次修复后的验证结论。

已导出完整12条404与2条Soft404 URL、最近抓取日期；canonical替代页仅取得10/43条示例。浏览器多次出现CDP输入超时，读取可用但点击/导出不稳定；20条Google规范页冲突、剩余33条替代页及23条noindex的完整明细尚未取得。没有编造Google选择的canonical或抓取时间。

原始GSC页面文本保存在本地忽略目录 `output/gsc-2026-11-01/`，不将含账户UI的原始快照提交仓库。公开URL与逐条处置见同目录下本报告配套CSV。

## 已确认处置

| URL模板/范围 | 数量 | 处置 | 原因 |
|---|---:|---|---|
| 无语言前缀的旧shop、compare、app、how-it-works、support和政策URL | 10 | 已修复代码，308到对应/en内容；等待上线复测及重抓 | 当前仍404，同内容新地址200；只维护明确映射，不将任意未知页跳到首页 |
| `/$`、`/&` | 2 | 有意排除，保留404 | 无真实对应内容，线上HTTP404 |
| `/ja/checkout` | 1 | 有意排除 | 当前200、noindex follow；匿名空购物车不是搜索落地页 |
| `/ar/collections/photochromic-sun` | 1 | 空分类noindex并移出Sitemap | 当前无商品，避免空列表作为可索引内容 |
| 六语言Create、Photochromic & Sun、Prescription Ready分类 | 18 | 与上行同一修复；随真实商品自动恢复资格 | 当前均为空；数量包含上行，不能相加为19 |
| 已取得canonical替代页示例中的checkout及contact参数页 | 10/43 | 有意排除/参数合并，等待Google重抓 | 保留颜色/SKU业务参数；结账noindex，联系页canonical到无参数URL |
| Google选择不同canonical | 20 | 证据不足 | 未取得逐URL Inspection中的userCanonical/googleCanonical对照，暂不改语言或合并页面 |
| noindex分类 | 23 | 证据不足，待逐URL核对 | 已知账户/购物车/结账/后台不应索引；不能据此宣称全部23条均合理 |
| Crawled/Discovered未收录 | 9 / 26 | 等待详细证据及重抓 | 未以“提交成功”替代Google实际索引决策 |
| redirect类别 | 4 | 证据不足；正常跳转允许保留 | 不为了清零报告取消正常永久跳转 |

## 全量技术检查

- `scripts/site-audit.mjs`：原185个Sitemap URL，160条额外内链，HTTP/标题/H1/canonical/JSON-LD基础检查无失败。
- `scripts/seo-consistency-audit.mjs`：185个Sitemap URL及其内链/hreflang共421地址，发现18个空分类Sitemap资格问题；未发现hreflang目标不可索引/规范页不一致/缺乏回链及HTTP断链。
- 全量逐URL技术证据：`sitemap-evidence-2026-11-01.csv`；GSC明细：`gsc-url-dispositions-2026-11-01.csv`。
- 新测试覆盖同内容旧URL映射与空/演示分类索引规则；现有News自动发布保持关闭，第三方Blog程序及周一Google定时配置未改动。

## 修改文件

- `next.config.ts`、`src/lib/seo/legacy-redirects.ts`：10条明确的永久跳转。
- `src/lib/seo/collection-indexability.ts`、`src/app/sitemap.ts`、`src/app/[locale]/[...segments]/page.tsx`：空分类的Sitemap、robots、hreflang资格一致。
- `src/lib/seo/indexability.test.ts`：规则回归测试。
- `scripts/seo-consistency-audit.mjs`：可复用的线上一致性检查工具。

## 验证原则

仅在对应修复上线且代表URL复测后发起验证。保留真实404和有意noindex，不要求每个排除类别变成零。GSC界面显示验证开始或通过才记为成功；Sitemap提交也不能等同验证修复。当前浏览器交互恢复前，验证状态记录为未提交。

## 发布与上线复测结果

- 修复提交 `ecf759b` 已推送 `shagaofeng-rgb/cowinglasses` 的 main；Vercel production `dpl_J3jAd5yrmx6muha61cEvqYo1RB7D` 为 READY，正式域名及www均绑定成功。
- 本地 lint、TypeScript、15项测试及完整production build均通过；本地未配置数据库，已跳过数据库bootstrap；Vercel生产环境构建亦成功。
- 全部10条旧URL实测308且对应目标200；两个无内容地址仍404；阿拉伯语空分类200并输出noindex follow。
- Sitemap从185条调整为167条，18个空分类均已移除。上线后再次检查167个Sitemap URL与内链/hreflang共415地址，问题数0。完整机器证据位于本地 `output/gsc-2026-11-01/postdeploy/consistency.json`。
- 上线后尝试点击Soft404的Validate fix，浏览器CDP输入超时；再次读取页面仍为“Finished fixing? / validate fix”，没有验证开始状态，故本次验证**未提交成功**。
- 当前仍需恢复浏览器连接后补齐20条Google规范页冲突、剩余33条替代页、23条noindex及其他类别明细；再按逐URL Inspection证据决定是否需要进一步修复。未用公开站点检测结果伪装GSC导出完成。
