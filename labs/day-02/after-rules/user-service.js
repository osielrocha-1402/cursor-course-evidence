const users = [];

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

function normalizeName(name) {
  return name.trim();
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function hasEmailSpaces(email) {
  return /\s/.test(email);
}

function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

function cloneUser(user) {
  return { ...user };
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

function normalizeUserData(userData) {
  return {
    name: normalizeName(userData.name),
    email: normalizeEmail(userData.email),
  };
}

function validateUserObject(userData) {
  if (!isPlainObject(userData)) {
    return "User data must be an object";
  }

  return null;
}

function validateUserName(name) {
  if (typeof name !== "string" || normalizeName(name) === "") {
    return "User name is required";
  }

  return null;
}

function validateUserEmail(email) {
  if (typeof email !== "string") {
    return "User email must be text";
  }

  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail === "") {
    return "User email is required";
  }

  if (hasEmailSpaces(email)) {
    return "User email must not contain spaces";
  }

  if (!isValidEmailFormat(normalizedEmail)) {
    return "User email format is invalid";
  }

  return null;
}

function validateUniqueEmail(email) {
  if (findUserByEmail(email)) {
    return "User email already exists";
  }

  return null;
}

function validateUserData(userData) {
  const validationError = getFirstValidationError([
    () => validateUserObject(userData),
    () => validateUserName(userData.name),
    () => validateUserEmail(userData.email),
  ]);

  if (validationError) {
    return validationError;
  }

  return validateUniqueEmail(normalizeEmail(userData.email));
}

function createUser(normalizedUserData) {
  return {
    id: users.length + 1,
    ...normalizedUserData,
  };
}

function addUser(userData) {
  const validationError = validateUserData(userData);

  if (validationError) {
    return createErrorResponse(validationError);
  }

  const normalizedUserData = normalizeUserData(userData);
  const newUser = createUser(normalizedUserData);
  users.push(newUser);

  return createSuccessResponse("User added successfully", {
    user: cloneUser(newUser),
  });
}

function getUsers() {
  return createSuccessResponse("Users retrieved successfully", {
    users: users.map(cloneUser),
  });
}

module.exports = {
  addUser,
  getUsers,
};
