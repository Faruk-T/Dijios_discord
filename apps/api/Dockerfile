FROM node:22-alpine
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @dijios-connect/contracts build && pnpm --filter @dijios-connect/api build
WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
