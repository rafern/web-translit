FROM ghcr.io/pnpm/pnpm:12.8.1 AS base
RUN pnpm runtime set node 24 -g

FROM base AS prod-deps
WORKDIR /app
COPY pnpm-lock.yaml /app/
RUN pnpm fetch --prod

FROM prod-deps AS build
WORKDIR /app
COPY . /app
RUN pnpm fetch
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY package.json /app/
CMD [ "pnpm", "start" ]