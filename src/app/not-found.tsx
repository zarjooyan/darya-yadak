import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Footer, Header } from "@/components/storefront";

export default function NotFound() {
  return <><Header/><main><section className="section"><div className="container" style={{textAlign:"center",paddingBlock:70}}><span className="category-icon" style={{margin:"0 auto 20px",width:70,height:70,fontSize:18}}>۴۰۴</span><h1 style={{fontSize:32,margin:"10px 0"}}>این صفحه پیدا نشد</h1><p style={{color:"var(--color-muted)",maxWidth:520,margin:"0 auto 24px"}}>ممکن است آدرس تغییر کرده باشد. از دسته‌بندی‌ها استفاده کن یا به صفحه اصلی برگرد.</p><div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}><Link className="btn btn-primary" href="/categories/">مشاهده دسته‌بندی‌ها <Search size={16}/></Link><Link className="btn btn-light" href="/">بازگشت به خانه <ArrowLeft size={16}/></Link></div></div></section></main><Footer/></>;
}
