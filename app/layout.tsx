import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site";
export const metadata:Metadata={metadataBase:new URL(siteConfig.url),title:{default:siteConfig.name,template:`%s · ${siteConfig.shortName}`},description:siteConfig.description,openGraph:{title:siteConfig.name,description:siteConfig.description,type:"website"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SiteHeader/><main id="main-content">{children}</main><SiteFooter/></body></html>}
