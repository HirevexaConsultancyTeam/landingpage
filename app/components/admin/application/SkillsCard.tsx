type Props = {
  skills: string[];
};

export default function SkillsCard({
  skills,
}: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-8">

      <h2 className="text-2xl font-semibold mb-6">
        Skills
      </h2>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-3">

          {skills.map((skill) => (
            <span
              key={skill}
              className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-medium"
            >
              {skill}
            </span>
          ))}

        </div>
      ) : (
        <p className="text-gray-500">
          No skills available.
        </p>
      )}

    </div>
  );
}