export type AdminPermission =
  | "dashboard.read"
  | "orders.read"
  | "catalog.read"
  | "customers.read"
  | "channels.read"
  | "analytics.read"
  | "settings.read";

export type AdminNavigationItem = {
  href: string;
  label: string;
  description: string;
  permission: AdminPermission;
  state?: "ready" | "setup";
};

export type AdminNavigationGroup = {
  label: string;
  items: AdminNavigationItem[];
};

export const adminNavigation: AdminNavigationGroup[] = [
  {
    label: "经营",
    items: [
      { href: "/admin", label: "数据概览", description: "销售、订单、库存与售后工作台", permission: "dashboard.read", state: "ready" },
      { href: "/admin/orders", label: "订单管理", description: "订单查询、状态处理与导出", permission: "orders.read" },
      { href: "/admin/payments", label: "支付与退款", description: "支付记录、退款与渠道状态", permission: "orders.read" },
      { href: "/admin/fulfillment", label: "发货与物流", description: "发货单、物流单号与追踪", permission: "orders.read" },
      { href: "/admin/returns", label: "退换货管理", description: "退货、换货和退款审批", permission: "orders.read" },
      { href: "/admin/invoices", label: "发票管理", description: "发票申请与开具记录", permission: "orders.read", state: "ready" },
      { href: "/admin/tickets", label: "售后工单", description: "客户问题与售后服务单", permission: "orders.read" },
    ],
  },
  {
    label: "商品",
    items: [
      { href: "/admin/products", label: "商品管理", description: "商品、图片、价格、上下架与 SEO", permission: "catalog.read" },
      { href: "/admin/categories", label: "商品分类", description: "分类层级与展示排序", permission: "catalog.read" },
      { href: "/admin/brands", label: "品牌管理", description: "品牌资料与关联商品", permission: "catalog.read" },
      { href: "/admin/attributes", label: "规格与属性", description: "商品选项、属性与 SKU 规则", permission: "catalog.read", state: "ready" },
      { href: "/admin/inventory", label: "库存管理", description: "可售库存、预警阈值与盘点", permission: "catalog.read" },
      { href: "/admin/inventory-ledger", label: "库存流水", description: "每次库存变动的可追溯记录", permission: "catalog.read" },
      { href: "/admin/suppliers", label: "供应商管理", description: "供应商、采购与供货资料", permission: "catalog.read", state: "ready" },
      { href: "/admin/promotions", label: "优惠与促销", description: "优惠券、折扣、满减与活动", permission: "catalog.read" },
      { href: "/admin/reviews", label: "评价管理", description: "商品评价审核与回复", permission: "catalog.read", state: "ready" },
    ],
  },
  {
    label: "客户与内容",
    items: [
      { href: "/admin/customers", label: "客户管理", description: "客户档案、订单历史、来源与备注", permission: "customers.read" },
      { href: "/admin/forms", label: "客户表单", description: "询盘、订阅与表单提交记录", permission: "customers.read" },
      { href: "/admin/customer-tags", label: "客户标签与分组", description: "标签、分群与运营人群", permission: "customers.read", state: "ready" },
      { href: "/admin/memberships", label: "会员等级", description: "会员规则与客户等级", permission: "customers.read", state: "ready" },
      { href: "/admin/loyalty", label: "积分与余额", description: "积分、余额与流水", permission: "customers.read", state: "ready" },
      { href: "/admin/abandoned-carts", label: "购物车与弃购", description: "弃购识别与提醒任务", permission: "customers.read", state: "ready" },
      { href: "/admin/news", label: "新闻管理", description: "新闻列表、草稿和发布", permission: "customers.read" },
      { href: "/admin/news-operations", label: "新闻自主运营", description: "发布计划与审核队列", permission: "customers.read", state: "ready" },
      { href: "/admin/blog", label: "博客管理", description: "文章、分类与 SEO", permission: "customers.read" },
      { href: "/admin/media", label: "媒体库", description: "图片、视频和文件资源", permission: "customers.read" },
      { href: "/admin/banners", label: "页面装修 / Banner 管理", description: "首页 Banner 与页面组件", permission: "customers.read" },
      { href: "/admin/seo", label: "SEO 数据", description: "页面元数据、收录和关键词", permission: "customers.read" },
    ],
  },
  {
    label: "渠道管理",
    items: [
      { href: "/admin/channels/facebook", label: "Facebook Page", description: "授权连接、发布与数据同步", permission: "channels.read", state: "setup" },
      { href: "/admin/channels/instagram", label: "Instagram", description: "授权连接、内容与数据同步", permission: "channels.read", state: "setup" },
      { href: "/admin/channels/google", label: "Google 渠道", description: "Google 配置与数据来源", permission: "channels.read", state: "setup" },
      { href: "/admin/channels/whatsapp", label: "WhatsApp", description: "消息渠道配置与客户会话", permission: "channels.read", state: "setup" },
      { href: "/admin/channel-orders", label: "渠道订单", description: "外部渠道订单归集", permission: "channels.read", state: "setup" },
      { href: "/admin/channel-data", label: "渠道数据", description: "渠道同步记录和指标", permission: "channels.read", state: "setup" },
    ],
  },
  {
    label: "数据与系统",
    items: [
      { href: "/admin/analytics/traffic", label: "访问分析", description: "访客、页面与访问趋势", permission: "analytics.read", state: "ready" },
      { href: "/admin/analytics/visitors", label: "访客明细", description: "访问次数、地区、设备与路径", permission: "analytics.read", state: "ready" },
      { href: "/admin/analytics/paths", label: "访问路径", description: "会话入口、页面序列与退出页", permission: "analytics.read", state: "ready" },
      { href: "/admin/analytics/attribution", label: "来源归因", description: "渠道与订单来源归因", permission: "analytics.read", state: "ready" },
      { href: "/admin/analytics/funnel", label: "转化漏斗", description: "浏览、加购、结账与支付漏斗", permission: "analytics.read", state: "ready" },
      { href: "/admin/reports/sales", label: "销售报表", description: "销售额、订单和退款报表", permission: "analytics.read" },
      { href: "/admin/reports/products", label: "商品分析", description: "商品销售、库存与转化分析", permission: "analytics.read" },
      { href: "/admin/reports/customers", label: "客户分析", description: "客户增长、复购与价值分析", permission: "analytics.read", state: "ready" },
      { href: "/admin/sync", label: "数据同步", description: "渠道、库存和内容同步任务", permission: "settings.read", state: "ready" },
      { href: "/admin/users", label: "用户与权限", description: "管理员、角色与权限范围", permission: "settings.read" },
      { href: "/admin/audit-logs", label: "操作日志", description: "后台关键操作与结果追踪", permission: "settings.read" },
      { href: "/admin/settings", label: "系统设置", description: "商城与后台基础配置", permission: "settings.read" },
      { href: "/admin/settings/payments", label: "支付配置", description: "支付服务商与回调配置", permission: "settings.read", state: "setup" },
      { href: "/admin/settings/logistics", label: "物流配置", description: "物流服务商与运费规则", permission: "settings.read", state: "setup" },
      { href: "/admin/settings/notifications", label: "通知设置", description: "订单、售后与营销通知", permission: "settings.read", state: "setup" },
    ],
  },
];

export const adminNavigationItems = adminNavigation.flatMap((group) => group.items);

export function getAdminNavigationItem(pathname: string) {
  return adminNavigationItems.find((item) => item.href === pathname);
}
