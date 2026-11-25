FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @dijios-connect/web-osgl build

FROM nginx:1.27-alpine
COPY apps/web-osgl/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web-osgl/dist /usr/share/nginx/html
EXPOSE 80
