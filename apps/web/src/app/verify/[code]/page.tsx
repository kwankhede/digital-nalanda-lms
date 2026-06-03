import { verifyCertificate } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  params,
}: {
  params: { code: string };
}) {
  const cert = await verifyCertificate(params.code);
  const valid = cert?.status === "valid";

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-extrabold text-brand-navy">
        Certificate Verification
      </h1>

      {!cert ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-lg font-bold text-red-600">❌ Invalid certificate</p>
          <p className="mt-1 text-sm text-red-500">
            No certificate matches this verification code.
          </p>
        </div>
      ) : (
        <div
          className={`mt-6 rounded-lg border p-6 ${
            valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          }`}
        >
          <p
            className={`text-lg font-bold ${
              valid ? "text-green-600" : "text-red-600"
            }`}
          >
            {valid ? "✓ Valid certificate" : "❌ Revoked certificate"}
          </p>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs uppercase text-gray-400">Student</dt>
              <dd className="text-sm font-medium">{cert.student_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Course</dt>
              <dd className="text-sm font-medium">{cert.course_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Certificate No.</dt>
              <dd className="text-sm font-medium">{cert.certificate_number}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Issue date</dt>
              <dd className="text-sm font-medium">{cert.issue_date}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
