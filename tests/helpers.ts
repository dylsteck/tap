import { generateId } from "ai";
import { getUnixTime } from "date-fns";

export function generateRandomTestUser() {
  const email = `test-${getUnixTime(new Date())}@playwright.com`;
  const password = generateId();

  return {
    email,
    password,
  };
}

export function generateTestMessage() {
  return `Test message ${Date.now()}`;
}

export function generateTestProject() {
  return {
    name: `Test Project ${Date.now()}`,
    prompt: `Create a simple counter app that displays a number and has buttons to increment and decrement.`,
  };
}

export function mockAuthenticatedSession() {
  return {
    user: {
      id: "test-user-id",
      email: "test@example.com",
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}
