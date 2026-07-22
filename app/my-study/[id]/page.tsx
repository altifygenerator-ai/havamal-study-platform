import { MyStudyEditor } from "@/components/my-study-editor";
import { getAllPassages } from "@/lib/data";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <div className="page-shell"><MyStudyEditor slug={id} passages={getAllPassages()}/></div>}
