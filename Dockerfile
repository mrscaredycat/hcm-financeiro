# node:20-slim (Debian slim com glibc) — necessário para o Oracle Instant Client.
# Alpine usa musl libc e não é compatível com as libs nativas da Oracle.
FROM node:20-slim

# ── Oracle Instant Client 21 ─────────────────────────────────────────────────
# Instala dependência de runtime (libaio) e ferramentas de download/extração.
# Em seguida baixa o Instant Client Basic da Oracle, extrai em /opt/oracle/instantclient
# e registra no ldconfig para que o oracledb (modo thick) encontre as libs.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libaio1 \
        wget \
        unzip \
    && rm -rf /var/lib/apt/lists/* \
    && wget -q https://download.oracle.com/otn_software/linux/instantclient/2115000/instantclient-basic-linux.x64-21.15.0.0.0dbru.zip \
    && unzip instantclient-basic-linux.x64-21.15.0.0.0dbru.zip \
    && rm    instantclient-basic-linux.x64-21.15.0.0.0dbru.zip \
    && mkdir -p /opt/oracle \
    && mv instantclient_21_15 /opt/oracle/instantclient \
    && echo /opt/oracle/instantclient > /etc/ld.so.conf.d/oracle-instantclient.conf \
    && ldconfig

# ── pnpm ─────────────────────────────────────────────────────────────────────
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copia os arquivos de dependência primeiro (para aproveitar o cache do Docker)
COPY package.json pnpm-lock.yaml ./

# Instala as dependências
RUN pnpm install --frozen-lockfile

# Copia o resto do projeto
COPY . .

# Build do Nuxt
RUN pnpm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production
# Informa ao oracledb onde estão as libs do Instant Client (modo thick)
ENV ORACLE_LIB_DIR=/opt/oracle/instantclient

CMD ["node", ".output/server/index.mjs"]
