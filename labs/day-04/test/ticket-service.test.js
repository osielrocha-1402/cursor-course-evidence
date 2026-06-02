const assert = require("node:assert/strict");
const path = require("node:path");
const { describe, it } = require("node:test");

const servicePath = path.join(__dirname, "..", "source-code", "ticket-service.js");

function loadFreshTicketService() {
  delete require.cache[require.resolve(servicePath)];
  return require(servicePath);
}

function createValidTicket(overrides = {}) {
  return {
    title: "Error al iniciar sesion",
    description: "El usuario no puede iniciar sesion con credenciales validas",
    priority: "media",
    ...overrides,
  };
}

describe("ticket service - creacion de tickets", () => {
  it("crea un ticket valido con datos normalizados y estado inicial", () => {
    const { createTicket, getTickets } = loadFreshTicketService();

    const response = createTicket(
      createValidTicket({
        title: "  Error   al iniciar sesion  ",
        description: "  El usuario   no puede iniciar sesion  ",
        priority: " ALTA ",
      })
    );

    assert.equal(response.success, true);
    assert.equal(response.message, "Ticket created successfully");
    assert.equal(Number.isSafeInteger(response.ticket.id), true);
    assert.equal(response.ticket.title, "Error al iniciar sesion");
    assert.equal(response.ticket.description, "El usuario no puede iniciar sesion");
    assert.equal(response.ticket.priority, "alta");
    assert.equal(response.ticket.status, "abierto");
    assert.equal(typeof response.ticket.createdAt, "string");
    assert.equal(typeof response.ticket.updatedAt, "string");

    const listResponse = getTickets();

    assert.equal(listResponse.success, true);
    assert.equal(listResponse.tickets.length, 1);
    assert.deepEqual(listResponse.tickets[0], response.ticket);
  });

  it("devuelve copias para evitar mutaciones accidentales del estado interno", () => {
    const { createTicket, getTickets } = loadFreshTicketService();

    const createResponse = createTicket(createValidTicket());
    createResponse.ticket.title = "Titulo alterado desde afuera";

    const listResponse = getTickets();

    assert.equal(listResponse.tickets[0].title, "Error al iniciar sesion");
  });
});

describe("ticket service - prevencion de duplicados", () => {
  it("rechaza tickets con el mismo titulo aunque cambien espacios o mayusculas", () => {
    const { createTicket } = loadFreshTicketService();

    const firstResponse = createTicket(createValidTicket({ title: "  Error Critico  " }));
    const duplicateResponse = createTicket(createValidTicket({ title: "error critico" }));

    assert.equal(firstResponse.success, true);
    assert.equal(duplicateResponse.success, false);
    assert.equal(duplicateResponse.code, "DUPLICATE_TICKET_TITLE");
    assert.equal(duplicateResponse.message, "Ticket title already exists");
  });
});

describe("ticket service - prioridades permitidas", () => {
  it("acepta solo las prioridades baja, media y alta", () => {
    const { createTicket } = loadFreshTicketService();
    const validPriorities = ["baja", "media", "alta"];

    validPriorities.forEach((priority, index) => {
      const response = createTicket(
        createValidTicket({
          title: `Ticket prioridad ${priority}`,
          priority,
        })
      );

      assert.equal(response.success, true, `priority ${priority} should be valid`);
      assert.equal(response.ticket.priority, validPriorities[index]);
    });
  });

  it("normaliza prioridades validas y rechaza prioridades invalidas", () => {
    const { createTicket } = loadFreshTicketService();

    const normalizedResponse = createTicket(
      createValidTicket({
        title: "Prioridad normalizada",
        priority: " ALTA ",
      })
    );
    const invalidResponse = createTicket(
      createValidTicket({
        title: "Prioridad invalida",
        priority: "urgente",
      })
    );
    const invalidTypeResponse = createTicket(
      createValidTicket({
        title: "Prioridad con tipo invalido",
        priority: 123,
      })
    );

    assert.equal(normalizedResponse.success, true);
    assert.equal(normalizedResponse.ticket.priority, "alta");
    assert.equal(invalidResponse.success, false);
    assert.match(invalidResponse.message, /Ticket priority must be one of/);
    assert.equal(invalidTypeResponse.success, false);
    assert.equal(invalidTypeResponse.message, "Ticket priority must be text");
  });
});

describe("ticket service - actualizacion de estados", () => {
  it("actualiza el estado cuando el ticket existe y el estado es valido", () => {
    const { createTicket, getTickets, updateTicketStatus } = loadFreshTicketService();

    const createResponse = createTicket(createValidTicket());
    const updateResponse = updateTicketStatus(createResponse.ticket.id, " EN PROGRESO ");

    assert.equal(updateResponse.success, true);
    assert.equal(updateResponse.message, "Ticket status updated successfully");
    assert.equal(updateResponse.ticket.status, "en progreso");
    assert.equal(typeof updateResponse.ticket.updatedAt, "string");

    const listResponse = getTickets();

    assert.equal(listResponse.tickets[0].status, "en progreso");
  });

  it("rechaza estados no permitidos", () => {
    const { createTicket, updateTicketStatus } = loadFreshTicketService();

    const createResponse = createTicket(createValidTicket());
    const updateResponse = updateTicketStatus(createResponse.ticket.id, "resuelto");

    assert.equal(updateResponse.success, false);
    assert.match(updateResponse.message, /Ticket status must be one of/);
  });
});

describe("ticket service - escenarios de error", () => {
  it("rechaza datos de ticket inexistentes, vacios o con tipos incorrectos", () => {
    const { createTicket } = loadFreshTicketService();

    assert.equal(createTicket(undefined).message, "Ticket data must be a plain object");
    assert.equal(createTicket(null).message, "Ticket data must be a plain object");
    assert.equal(createTicket([]).message, "Ticket data must be a plain object");
    assert.equal(createTicket({}).message, "Ticket data must not be empty");
    assert.equal(createTicket(createValidTicket({ title: "" })).message, "Ticket title is required");
    assert.equal(
      createTicket(createValidTicket({ description: "   " })).message,
      "Ticket description is required"
    );
  });

  it("rechaza textos demasiado largos o con caracteres de control", () => {
    const { createTicket } = loadFreshTicketService();

    const longTitleResponse = createTicket(
      createValidTicket({
        title: "a".repeat(121),
      })
    );
    const invalidDescriptionResponse = createTicket(
      createValidTicket({
        title: "Descripcion con caracter invalido",
        description: "Texto valido\u0000Texto invalido",
      })
    );

    assert.equal(longTitleResponse.success, false);
    assert.equal(longTitleResponse.message, "Ticket title must be at most 120 characters");
    assert.equal(invalidDescriptionResponse.success, false);
    assert.equal(invalidDescriptionResponse.message, "Ticket description must not contain control characters");
  });

  it("diferencia IDs invalidos de tickets inexistentes", () => {
    const { updateTicketStatus } = loadFreshTicketService();

    const stringIdResponse = updateTicketStatus("1", "cerrado");
    const floatIdResponse = updateTicketStatus(1.5, "cerrado");
    const nanIdResponse = updateTicketStatus(Number.NaN, "cerrado");
    const missingTicketResponse = updateTicketStatus(999, "cerrado");

    assert.equal(stringIdResponse.success, false);
    assert.equal(stringIdResponse.code, "INVALID_TICKET_ID");
    assert.equal(floatIdResponse.code, "INVALID_TICKET_ID");
    assert.equal(nanIdResponse.code, "INVALID_TICKET_ID");
    assert.equal(missingTicketResponse.success, false);
    assert.equal(missingTicketResponse.code, "TICKET_NOT_FOUND");
    assert.equal(missingTicketResponse.message, "Ticket with id 999 was not found");
  });
});
