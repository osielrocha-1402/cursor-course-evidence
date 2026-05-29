const tickets = [];

let nextTicketId = 1;

const VALID_PRIORITIES = Object.freeze(["baja", "media", "alta"]);
const VALID_STATUSES = Object.freeze(["abierto", "en progreso", "cerrado"]);

const DEFAULT_STATUS = "abierto";
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const INVALID_CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

const ERROR_CODES = Object.freeze({
  DUPLICATE_TICKET_TITLE: "DUPLICATE_TICKET_TITLE",
  INVALID_TICKET_DATA: "INVALID_TICKET_DATA",
  INVALID_TICKET_ID: "INVALID_TICKET_ID",
  TICKET_CREATION_FAILED: "TICKET_CREATION_FAILED",
  TICKET_NOT_FOUND: "TICKET_NOT_FOUND",
  TICKET_UPDATE_FAILED: "TICKET_UPDATE_FAILED",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
});

function createSuccessResponse(message, data = {}) {
  const safeData = isPlainObject(data) ? cloneValue(data) : {};

  return {
    ...safeData,
    success: true,
    message: normalizeText(message) || "Operation completed successfully",
  };
}

function createErrorResponse(message, code = ERROR_CODES.VALIDATION_ERROR) {
  return {
    success: false,
    code: normalizeText(code) || ERROR_CODES.VALIDATION_ERROR,
    message: normalizeText(message) || "Request could not be processed",
  };
}

function executeSafely(operation, fallbackMessage) {
  try {
    if (typeof operation !== "function") {
      return createErrorResponse("Operation must be a function", ERROR_CODES.UNEXPECTED_ERROR);
    }

    return operation();
  } catch (error) {
    return createErrorResponse(fallbackMessage, ERROR_CODES.UNEXPECTED_ERROR);
  }
}

function createValidationError(message, code = ERROR_CODES.VALIDATION_ERROR) {
  return {
    code,
    message,
  };
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function hasOwnProperty(objectValue, propertyName) {
  return isPlainObject(objectValue) && Object.prototype.hasOwnProperty.call(objectValue, propertyName);
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function normalizeLowercaseText(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeTitleForComparison(title) {
  return normalizeLowercaseText(title);
}

function normalizePriority(priority) {
  return normalizeLowercaseText(priority);
}

function normalizeStatus(status) {
  return normalizeLowercaseText(status);
}

function hasInvalidCharacters(value) {
  return typeof value === "string" && INVALID_CONTROL_CHARACTERS.test(value);
}

function cloneValue(value) {
  try {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
  } catch (error) {
    return clonePlainValue(value);
  }

  return clonePlainValue(value);
}

function clonePlainValue(value) {
  if (Array.isArray(value)) {
    return value.map(clonePlainValue);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.entries(value).reduce((clone, [key, entryValue]) => {
    clone[key] = clonePlainValue(entryValue);
    return clone;
  }, {});
}

function cloneTicket(ticket) {
  if (!isPlainObject(ticket)) {
    return null;
  }

  return cloneValue(ticket);
}

function freezeTicket(ticket) {
  const ticketCopy = cloneTicket(ticket);

  if (!ticketCopy) {
    return null;
  }

  return Object.freeze(ticketCopy);
}

function createTimestamp() {
  return new Date().toISOString();
}

function getFirstValidationError(validators) {
  if (!Array.isArray(validators)) {
    return createValidationError("Validators must be an array");
  }

  for (const validate of validators) {
    if (typeof validate !== "function") {
      return createValidationError("Validator must be a function");
    }

    const error = validate();

    if (error) {
      return error;
    }
  }

  return null;
}

function validateTicketId(ticketId) {
  if (!Number.isSafeInteger(ticketId) || ticketId <= 0) {
    return createValidationError("Ticket id must be a positive integer", ERROR_CODES.INVALID_TICKET_ID);
  }

  return null;
}

function validateTicketObject(ticketData) {
  if (!isPlainObject(ticketData)) {
    return createValidationError("Ticket data must be a plain object", ERROR_CODES.INVALID_TICKET_DATA);
  }

  if (Object.keys(ticketData).length === 0) {
    return createValidationError("Ticket data must not be empty", ERROR_CODES.INVALID_TICKET_DATA);
  }

  return null;
}

function validateTextField(value, fieldName, maxLength) {
  if (typeof value !== "string") {
    return createValidationError(`${fieldName} must be text`);
  }

  const normalizedValue = normalizeText(value);

  if (normalizedValue === "") {
    return createValidationError(`${fieldName} is required`);
  }

  if (Number.isSafeInteger(maxLength) && normalizedValue.length > maxLength) {
    return createValidationError(`${fieldName} must be at most ${maxLength} characters`);
  }

  if (hasInvalidCharacters(value)) {
    return createValidationError(`${fieldName} must not contain control characters`);
  }

  return null;
}

function validateTicketTitle(title) {
  return validateTextField(title, "Ticket title", MAX_TITLE_LENGTH);
}

function validateTicketDescription(description) {
  return validateTextField(description, "Ticket description", MAX_DESCRIPTION_LENGTH);
}

function validateTicketPriority(priority) {
  if (typeof priority !== "string") {
    return createValidationError("Ticket priority must be text");
  }

  const normalizedPriority = normalizePriority(priority);

  if (normalizedPriority === "") {
    return createValidationError("Ticket priority is required");
  }

  if (!VALID_PRIORITIES.includes(normalizedPriority)) {
    return createValidationError(`Ticket priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
  }

  return null;
}

function validateTicketStatus(status) {
  if (typeof status !== "string") {
    return createValidationError("Ticket status must be text");
  }

  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "") {
    return createValidationError("Ticket status is required");
  }

  if (!VALID_STATUSES.includes(normalizedStatus)) {
    return createValidationError(`Ticket status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  return null;
}

function validateOptionalTicketStatus(ticketData) {
  if (!hasOwnProperty(ticketData, "status") || ticketData.status === undefined) {
    return null;
  }

  return validateTicketStatus(ticketData.status);
}

function validateUniqueTitle(title) {
  const titleError = validateTicketTitle(title);

  if (titleError) {
    return titleError;
  }

  if (ticketRepository.existsByTitle(title)) {
    return createValidationError("Ticket title already exists", ERROR_CODES.DUPLICATE_TICKET_TITLE);
  }

  return null;
}

function validateTicketData(ticketData) {
  const validationError = getFirstValidationError([
    () => validateTicketObject(ticketData),
    () => validateTicketTitle(ticketData.title),
    () => validateTicketDescription(ticketData.description),
    () => validateTicketPriority(ticketData.priority),
    () => validateOptionalTicketStatus(ticketData),
  ]);

  if (validationError) {
    return validationError;
  }

  return validateUniqueTitle(ticketData.title);
}

function validateTicketRecord(ticket) {
  return getFirstValidationError([
    () => validateTicketObject(ticket),
    () => validateTicketId(ticket.id),
    () => validateTicketTitle(ticket.title),
    () => validateTicketDescription(ticket.description),
    () => validateTicketPriority(ticket.priority),
    () => validateTicketStatus(ticket.status),
  ]);
}

function normalizeTicketData(ticketData) {
  const hasCustomStatus = hasOwnProperty(ticketData, "status") && ticketData.status !== undefined;

  return {
    title: normalizeText(ticketData?.title),
    description: normalizeText(ticketData?.description),
    priority: normalizePriority(ticketData?.priority),
    status: hasCustomStatus ? normalizeStatus(ticketData.status) : DEFAULT_STATUS,
  };
}

function reserveNextTicketId() {
  const idError = validateTicketId(nextTicketId);

  if (idError) {
    return null;
  }

  const ticketId = nextTicketId;
  nextTicketId += 1;

  return ticketId;
}

function createTicketRecord(ticketData) {
  const normalizedTicketData = normalizeTicketData(ticketData);
  const normalizedDataError = getFirstValidationError([
    () => validateTicketTitle(normalizedTicketData.title),
    () => validateTicketDescription(normalizedTicketData.description),
    () => validateTicketPriority(normalizedTicketData.priority),
    () => validateTicketStatus(normalizedTicketData.status),
  ]);

  if (normalizedDataError) {
    return null;
  }

  const ticketId = reserveNextTicketId();

  if (!ticketId) {
    return null;
  }

  const timestamp = createTimestamp();
  const ticketRecord = {
    id: ticketId,
    title: normalizedTicketData.title,
    description: normalizedTicketData.description,
    priority: normalizedTicketData.priority,
    status: normalizedTicketData.status,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (validateTicketRecord(ticketRecord)) {
    return null;
  }

  return ticketRecord;
}

function findTicketIndexById(ticketId) {
  if (validateTicketId(ticketId)) {
    return -1;
  }

  return tickets.findIndex((ticket) => ticket.id === ticketId);
}

function findTicketById(ticketId) {
  const ticketIndex = findTicketIndexById(ticketId);

  if (ticketIndex === -1) {
    return null;
  }

  return cloneTicket(tickets[ticketIndex]);
}

function findTicketByTitle(title) {
  if (validateTicketTitle(title)) {
    return null;
  }

  const normalizedTitle = normalizeTitleForComparison(title);

  return tickets.find((ticket) => normalizeTitleForComparison(ticket.title) === normalizedTitle) || null;
}

const ticketRepository = Object.freeze({
  add(ticketRecord) {
    if (validateTicketRecord(ticketRecord)) {
      return null;
    }

    const storedTicket = freezeTicket(ticketRecord);

    if (!storedTicket) {
      return null;
    }

    tickets.push(storedTicket);

    return cloneTicket(storedTicket);
  },

  existsByTitle(title) {
    return Boolean(findTicketByTitle(title));
  },

  findById(ticketId) {
    return findTicketById(ticketId);
  },

  list() {
    return tickets.map(cloneTicket).filter(Boolean);
  },

  updateStatus(ticketId, status) {
    const idError = validateTicketId(ticketId);
    const statusError = validateTicketStatus(status);

    if (idError || statusError) {
      return null;
    }

    const ticketIndex = findTicketIndexById(ticketId);

    if (ticketIndex === -1) {
      return null;
    }

    const updatedTicket = freezeTicket({
      ...tickets[ticketIndex],
      status: normalizeStatus(status),
      updatedAt: createTimestamp(),
    });

    if (!updatedTicket || validateTicketRecord(updatedTicket)) {
      return null;
    }

    tickets[ticketIndex] = updatedTicket;

    return cloneTicket(updatedTicket);
  },
});

function createTicket(ticketData) {
  return executeSafely(() => {
    const validationError = validateTicketData(ticketData);

    if (validationError) {
      return createErrorResponse(validationError.message, validationError.code);
    }

    const ticketRecord = createTicketRecord(ticketData);

    if (!ticketRecord) {
      return createErrorResponse(
        "Ticket could not be created with the provided data",
        ERROR_CODES.TICKET_CREATION_FAILED
      );
    }

    const savedTicket = ticketRepository.add(ticketRecord);

    if (!savedTicket) {
      return createErrorResponse("Ticket could not be saved", ERROR_CODES.TICKET_CREATION_FAILED);
    }

    return createSuccessResponse("Ticket created successfully", {
      ticket: savedTicket,
    });
  }, "Unexpected error while creating ticket");
}

function updateTicketStatus(ticketId, status) {
  return executeSafely(() => {
    const idError = validateTicketId(ticketId);

    if (idError) {
      return createErrorResponse(idError.message, idError.code);
    }

    const statusError = validateTicketStatus(status);

    if (statusError) {
      return createErrorResponse(statusError.message, statusError.code);
    }

    if (!ticketRepository.findById(ticketId)) {
      return createErrorResponse(`Ticket with id ${ticketId} was not found`, ERROR_CODES.TICKET_NOT_FOUND);
    }

    const updatedTicket = ticketRepository.updateStatus(ticketId, status);

    if (!updatedTicket) {
      return createErrorResponse("Ticket status could not be updated", ERROR_CODES.TICKET_UPDATE_FAILED);
    }

    return createSuccessResponse("Ticket status updated successfully", {
      ticket: updatedTicket,
    });
  }, "Unexpected error while updating ticket status");
}

function getTickets() {
  return executeSafely(
    () =>
      createSuccessResponse("Tickets retrieved successfully", {
        tickets: ticketRepository.list(),
      }),
    "Unexpected error while retrieving tickets"
  );
}

module.exports = {
  createTicket,
  getTickets,
  updateTicketStatus,
};
