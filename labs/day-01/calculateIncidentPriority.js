const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];
const CLOSED_STATUSES = ["RESOLVED", "CLOSED"];

const HOURS_FOR_MEDIUM = 8;
const HOURS_FOR_HIGH = 24;
const HOURS_FOR_CRITICAL = 72;

function calculateIncidentPriority(priority, status, hoursOpen) {
  const normalizedPriority = String(priority).toUpperCase();
  const normalizedStatus = String(status).toUpperCase();

  if (!VALID_PRIORITIES.includes(normalizedPriority)) {
    throw new Error("Invalid priority");
  }

  if (!VALID_STATUSES.includes(normalizedStatus)) {
    throw new Error("Invalid status");
  }

  if (typeof hoursOpen !== "number" || !Number.isFinite(hoursOpen) || hoursOpen < 0) {
    throw new Error("Invalid hoursOpen");
  }

  if (CLOSED_STATUSES.includes(normalizedStatus)) {
    return "LOW";
  }

  if (normalizedPriority === "CRITICAL" || hoursOpen >= HOURS_FOR_CRITICAL) {
    return "CRITICAL";
  }

  if (normalizedPriority === "HIGH" || hoursOpen >= HOURS_FOR_HIGH) {
    return "HIGH";
  }

  if (normalizedPriority === "MEDIUM" || hoursOpen >= HOURS_FOR_MEDIUM) {
    return "MEDIUM";
  }

  return "LOW";
}

module.exports = calculateIncidentPriority;
