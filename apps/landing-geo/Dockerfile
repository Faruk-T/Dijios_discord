FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @dijios-connect/landing-geo build

FROM nginx:1.27-alpine
COPY --from=build /repo/apps/landing-geo/dist /usr/share/nginx/html
EXPOSE 80
