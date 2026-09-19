export const businessDetails = {
  legalName: "Quzhou Qiying Import & Export Co., Ltd.",
  registeredAddress: "Room 110, 1st Floor, Building 2, Qushidai Future Building, Kecheng District, Quzhou City, Zhejiang Province, China",
  supportEmail: "info@cowinglasses.com",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Room%20110%2C%201st%20Floor%2C%20Building%202%2C%20Qushidai%20Future%20Building%2C%20Kecheng%20District%2C%20Quzhou%20City%2C%20Zhejiang%20Province%2C%20China",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || undefined,
  effectiveDate: "25 August 2026",
} as const;
