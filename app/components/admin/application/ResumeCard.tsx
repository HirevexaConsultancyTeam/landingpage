type Props = {
  resumeUrl: string | null;
};

export default function ResumeCard({
  resumeUrl,
}: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-8">

      <h2 className="text-2xl font-semibold mb-6">
        Resume
      </h2>

      {resumeUrl ? (
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex px-6 py-3 rounded-lg bg-[#FF9900] text-white font-semibold hover:bg-[#e88d00]"
        >
          View Resume
        </a>
      ) : (
        <p className="text-gray-500">
          Resume not uploaded.
        </p>
      )}

    </div>
  );
}