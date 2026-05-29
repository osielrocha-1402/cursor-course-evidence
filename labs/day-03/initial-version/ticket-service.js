const tickets = [];

const VALID_PRIORITIES = ["baja", "media", "alta"];
const DEFAULT_STATUS = "abierto";

function createSuccessResponse(message, data = {}) {
  return {
    success: true,
    message,
    ...data,
  };
}

function createErrorResponse(message) {
  return {
    success: false,
    message,
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value) {
  return value.trim();
}

function normalizeTitle(title) {
  return normalizeText(title).toLowerCase();
}

function isValidPriority(priority) {
  return VALID_PRIORITIES.includes(priority);
}

function cloneTicket(ticket) {
  return { ...ticket };
}

function findTicketById(ticketId) {
  return tickets.find((ticket) => ticket.id === ticketId);
}

function findTicketByTitle(title) {
  const normalizedTitle = normalizeTitle(title);

  return tickets.find((ticket) => normalizeTitle(ticket.title) === normalizedTitle);
}

function getFirstValidationError(validators) {
  for (const validate of validators) {
    const error = validate();

    if (error) {
      return error;
    }
  }

  return null;
}

function validateRequiredText(value, fieldName) {
  if (typeof value !== "string" || normalizeText(value) === "") {
    return `${fieldName} is required`;
  }

  return null;
}

function validateTicketObject(ticketData) {
  if (!isPlainObject(ticketData)) {
    return "Ticket data must be an object";
  }

  return null;
}

function validateTicketPriority(priority) {
  if (typeof priority !== "string" || !isValidPriority(priority)) {
    return `Ticket priority must be one of: ${VALID_PRIORITIES.join(", ")}`;
  }

  return null;
}

function validateUniqueTitle(title) {
  if (findTicketByTitle(title)) {
    return "Ticket title already exists";
  }

  return null;
}

function validateTicketData(ticketData) {
  const validationError = getFirstValidationError([
    () => validateTicketObject(ticketData),
    () => validateRequiredText(ticketData.title, "Ticket title"),
    () => validateRequiredText(ticketData.description, "Ticket description"),
    () => validateTicketPriority(ticketData.priority),
  ]);

  if (validationError) {
    return validationError;
  }

  return validateUniqueTitle(ticketData.title);
}

function normalizeTicketData(ticketData) {
  return {
    title: normalizeText(ticketData.title),
    description: normalizeText(ticketData.description),
    priority: ticketData.priority,
  };
}

function createTicketRecord(ticketData) {
  return {
    id: tickets.length + 1,
    ...ticketData,
    status: DEFAULT_STATUS,
  };
}

function createTicket(ticketData) {
  const validationError = validateTicketData(ticketData);

  if (validationError) {
    return createErrorResponse(validationError);
  }

  const normalizedTicketData = normalizeTicketData(ticketData);
  const newTicket = createTicketRecord(normalizedTicketData);
  tickets.push(newTicket);

  return createSuccessResponse("Ticket created successfully", {
    ticket: cloneTicket(newTicket),
  });
}

function validateTicketStatus(status) {
  return validateRequiredText(status, "Ticket status");
}

function updateTicketStatus(ticketId, status) {
  const ticket = findTicketById(ticketId);

  if (!ticket) {
    return createErrorResponse("Ticket not found");
  }

  const validationError = validateTicketStatus(status);

  if (validationError) {
    return createErrorResponse(validationError);
  }

  ticket.status = normalizeText(status);

  return createSuccessResponse("Ticket status updated successfully", {
    ticket: cloneTicket(ticket),
  });
}

function getTickets() {
  return createSuccessResponse("Tickets retrieved successfully", {
    tickets: tickets.map(cloneTicket),
  });
}

module.exports = {
  createTicket,
  getTickets,
  updateTicketStatus,
};
