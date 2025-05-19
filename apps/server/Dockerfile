FROM oven/bun:1 AS build

WORKDIR /app

# Cache packages
COPY package.json package.json
COPY bun.lock bun.lock

COPY /apps/server/package.json ./apps/server/package.json
COPY /packages/common/package.json ./packages/common/package.json
COPY /packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY /packages/sdk/package.json ./packages/sdk/package.json
COPY /packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN bun install

COPY /apps/server ./apps/server
COPY /packages/common ./packages/common
COPY /packages/eslint-config ./packages/eslint-config
COPY /packages/sdk ./packages/sdk
COPY /packages/typescript-config ./packages/typescript-config

ENV NODE_ENV=production

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	./apps/server/src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3001