type Props = {
  college: string | null;
  degree: string | null;
  branch: string | null;
  cgpa: string | null;
};

export default function EducationCard({
  college,
  degree,
  branch,
  cgpa,
}: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-8">

      <h2 className="text-2xl font-semibold mb-6">
        Education
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <p className="text-sm text-gray-500">
            College
          </p>

          <p className="font-medium">
            {college || "-"}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Degree
          </p>

          <p className="font-medium">
            {degree || "-"}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Branch
          </p>

          <p className="font-medium">
            {branch || "-"}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            CGPA
          </p>

          <p className="font-medium">
            {cgpa || "-"}
          </p>

        </div>

      </div>

    </div>
  );
}