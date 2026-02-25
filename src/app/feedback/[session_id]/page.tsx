interface FeedbackPageProps {
  params: Promise<{
    session_id: string;
  }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { session_id } = await params;

  return (
    <div className="px-12 py-8">
      <p>Feedback (session: {session_id})</p>
    </div>
  );
}
