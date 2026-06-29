"use client";

type Props = {
  form: {
    status: string;
    notes: string;
    interviewDate: string;
    offerSalary: string;
    rejectionReason: string;
  };

  setForm: React.Dispatch<
    React.SetStateAction<{
      status: string;
      notes: string;
      interviewDate: string;
      offerSalary: string;
      rejectionReason: string;
    }>
  >;

  saveApplication: () => void;

  saving: boolean;
};

export default function RecruiterActions({
  form,
  setForm,
  saveApplication,
  saving,
}: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-8">

      <h2 className="text-2xl font-semibold mb-8">
        Recruiter Actions
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="text-sm text-gray-500">
            Status
          </label>

          <select
            className="w-full border rounded-lg p-3 mt-2"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value,
              })
            }
          >
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">
              Under Review
            </option>
            <option value="INTERVIEW_SCHEDULED">
              Interview Scheduled
            </option>
            <option value="OFFER_RECEIVED">
              Offer Received
            </option>
            <option value="PLACED">
              Placed
            </option>
            <option value="REJECTED">
              Rejected
            </option>
          </select>

        </div>

        <div>

          <label className="text-sm text-gray-500">
            Interview Date
          </label>

          <input
            type="date"
            className="w-full border rounded-lg p-3 mt-2"
            value={form.interviewDate}
            onChange={(e) =>
              setForm({
                ...form,
                interviewDate: e.target.value,
              })
            }
          />

        </div>

        <div>

          <label className="text-sm text-gray-500">
            Offer Salary
          </label>

          <input
            className="w-full border rounded-lg p-3 mt-2"
            value={form.offerSalary}
            onChange={(e) =>
              setForm({
                ...form,
                offerSalary: e.target.value,
              })
            }
          />

        </div>

        <div>

          <label className="text-sm text-gray-500">
            Rejection Reason
          </label>

          <input
            className="w-full border rounded-lg p-3 mt-2"
            value={form.rejectionReason}
            onChange={(e) =>
              setForm({
                ...form,
                rejectionReason: e.target.value,
              })
            }
          />

        </div>

      </div>

      <div className="mt-8">

        <label className="text-sm text-gray-500">
          Recruiter Notes
        </label>

        <textarea
          rows={6}
          className="w-full border rounded-lg p-3 mt-2"
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes: e.target.value,
            })
          }
        />

      </div>

      <button
        onClick={saveApplication}
        disabled={saving}
        className="mt-8 bg-[#FF9900] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e88d00]"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

    </div>
  );
}