type Props = {
  company: string;
  role: string;
  location: string | null;
  salary: string | null;
  jobType: string | null;
};

export default function JobCard({
  company,
  role,
  location,
  salary,
  jobType,
}: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-8">

      <h2 className="text-2xl font-semibold mb-6">
        Applied Job
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <p className="text-sm text-gray-500">
            Company
          </p>

          <p className="font-medium">
            {company}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Role
          </p>

          <p className="font-medium">
            {role}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Location
          </p>

          <p className="font-medium">
            {location || "-"}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Salary
          </p>

          <p className="font-medium">
            {salary || "-"}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Job Type
          </p>

          <p className="font-medium">
            {jobType
              ? jobType.replaceAll("_", " ")
              : "-"}
          </p>

        </div>

      </div>

    </div>
  );
}