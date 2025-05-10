FROM oven/bun:1

WORKDIR /app

# Copy the server's package.json and bun.lock
COPY package.json ./package.json
COPY bun.lock ./bun.lock

# Install only production dependencies.
RUN bun install

# Copy the application's source code into the container
COPY src ./src


# Expose the Hono server on port 3000
EXPOSE 3000

# Command to run your Hono server
# This assumes your entry point is src/main.ts
CMD ["bun", "run", "start"]