import { Suspense } from "react";
import BoardContent from "./_BoardContent";
import "@/styles/pages/board.scss";

export default function BoardPage() {
  return (
    <Suspense>
      <BoardContent />
    </Suspense>
  );
}
