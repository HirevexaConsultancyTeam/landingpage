// ============================================================================
//  DESTINATION:  lib/constants.ts   (new file)
//
//  Shared option lists. Previously these were duplicated in the profile page
//  and the onboarding page, so adding a degree meant remembering both.
// ============================================================================

export const DEGREE_OPTIONS = [
  "B.Tech / B.E.",
  "B.Pharma",
  "M.Pharma",
  "BCA",
  "B.Sc",
  "B.Com",
  "BA",
  "BBA",
  "MCA",
  "MBA",
  "M.Tech",
  "M.Sc",
  "M.Com",
  "Diploma",
  "Polytechnic",
  "ITI",
  "Certificate Course",
  "Other",
];

/**
 * Graduation years, newest first.
 *
 * Runs from three years ahead (students who haven't graduated yet) back to
 * 2010. Computed from the current year rather than hardcoded, so it doesn't
 * silently go stale — a hardcoded list that stops at 2033 becomes a bug in 2034
 * that nobody notices until a candidate can't complete their profile.
 */
export const GRAD_YEARS: number[] = (() => {
  const current = new Date().getFullYear();
  const newest = current + 3;
  const oldest = 2010;
  return Array.from({ length: newest - oldest + 1 }, (_, i) => newest - i);
})();

export const LOCATION_OPTIONS = [
  "Delhi NCR", "Mumbai", "Bangalore", "Hyderabad",
  "Chennai", "Pune", "Kolkata", "Ahmedabad", "Any Location",
];

export const EXP_OPTIONS = ["fresher", "0-1 years", "1-2 years", "2-5 years", "5+ years"];

export const JOB_TYPE_OPTIONS = [
  "Full-time Employment",
  "Internship + PPO",
  "Remote / WFH",
  "Startup",
  "Government / PSU",
];

export const SALARY_OPTIONS = ["2–4 LPA", "4–6 LPA", "6–10 LPA", "10+ LPA"];