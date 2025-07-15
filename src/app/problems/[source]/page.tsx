"use client";

import { useParams } from "next/navigation";

export default function ProblemCategoryPage() {
  const { source } = useParams();

  return (
    <div>
      <h1>Problems from {source}</h1>
    </div>
  );
}
