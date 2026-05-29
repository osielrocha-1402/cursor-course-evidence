const users = [];

function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function addUser(user) {
  if (!user || typeof user !== "object") {
    return {
      success: false,
      message: "Invalid user data",
    };
  }

  const name = typeof user.name === "string" ? user.name.trim() : "";
  const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "Invalid email format",
    };
  }

  const emailAlreadyExists = users.some((storedUser) => storedUser.email === email);

  if (emailAlreadyExists) {
    return {
      success: false,
      message: "Email already exists",
    };
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);

  return {
    success: true,
    message: "User added successfully",
    user: newUser,
  };
}

function getUsers() {
  return {
    success: true,
    message: "Users retrieved successfully",
    users: [...users],
  };
}

module.exports = {
  addUser,
  getUsers,
};
