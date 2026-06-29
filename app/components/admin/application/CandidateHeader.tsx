type Props = {
  firstName: string;
  lastName: string;
  email: string;
  city: string | null;
  experience: string;
  status: string;
};

export default function CandidateHeader({
  firstName,
  lastName,
  email,
  city,
  experience,
  status,
}: Props) {
  const statusColor = {
    APPLIED: "bg-blue-100 text-blue-700",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
    INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-700",
    OFFER_RECEIVED: "bg-green-100 text-green-700",
    PLACED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  } as const;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-8">

      <div className="flex items-start justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            {firstName} {lastName}
          </h1>

          <p className="text-gray-500 mt-2">
            {email}
          </p>

        </div>

        <span
          className={`px-4 py-2 rounded-full font-semibold ${
            statusColor[
              status as keyof typeof statusColor
            ] ??
            "bg-gray-100 text-gray-700"
          }`}
        >
          {status.replaceAll("_", " ")}
        </span>

      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">

        <div>

          <p className="text-sm text-gray-500">
            City
          </p>

          <p className="font-medium">
            {city || "-"}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Experience
          </p>

          <p className="font-medium capitalize">
            {experience}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Current Status
          </p>

          <p className="font-medium">
            {status.replaceAll("_", " ")}
          </p>

        </div>

      </div>

    </div>
  );
}