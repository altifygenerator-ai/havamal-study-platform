import { MyStudyEditor } from "@/components/my-study-editor";
import { getCompleteCorpus } from "@/lib/complete-corpus";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const passages = (await getCompleteCorpus()).passages;
  return (
    <div className="page-shell">
      <MyStudyEditor slug={id} passages={passages} />
    </div>
  );
}
