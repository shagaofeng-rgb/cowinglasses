import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
export default function IndexPage() { redirect(`/${siteConfig.defaultLocale}`); }
