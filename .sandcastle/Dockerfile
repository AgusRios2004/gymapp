FROM node:22-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  jq \
  && rm -rf /var/lib/apt/lists/*

# JDK 21 para gymapp-back. Bookworm solo trae openjdk-17 por apt y el
# proyecto compila con Java 21, así que se copia el JDK de la imagen oficial
# de Temurin en vez de sumar un repositorio de paquetes.
COPY --from=eclipse-temurin:21-jdk /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk

# Build-args for UID/GID alignment: sandcastle docker build-image
# defaults these to the host user's UID/GID so image-built files
# and bind-mounted files share an owner without runtime chown.
ARG AGENT_UID=1000
ARG AGENT_GID=1000

# Rename the base image's "node" user to "agent" and align UID/GID.
RUN groupmod -o -g $AGENT_GID node && usermod -o -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -l agent node
USER ${AGENT_UID}:${AGENT_GID}

# Install Claude Code CLI
RUN curl -fsSL https://claude.ai/install.sh | bash

# Add Claude Code CLI and the JDK to PATH
ENV PATH="/home/agent/.local/bin:${JAVA_HOME}/bin:$PATH"

# Precachear dependencias DENTRO de la imagen. Sandcastle levanta un
# contenedor nuevo por fase (planner, test-author, reviewer, merger) y cada
# uno corre commands.install: en frío fueron 609 s el 13/09/2026, contra el
# timeout de 300 s de onSandboxReady en main.mts. Con ~/.m2 y ~/.npm ya
# poblados, el install en runtime solo resuelve contra la caché.
#
# Por eso esta imagen se construye con npm run sandcastle:image, que copia
# los manifiestos a .sandcastle/deps/ antes del build, y hay que
# RECONSTRUIRLA cuando cambian gymapp-back/pom.xml o
# gym-frontend/package-lock.json. Si no, sigue andando, pero vuelve a bajar
# lo nuevo en cada contenedor.
#
# Se copia a /home/agent/deps y no a /tmp: COPY crea los directorios padre
# como root, y el usuario agent no puede borrar después lo que quedó en un
# padre ajeno (el 13/09/2026 eso tumbó el build al final, con Maven ya OK).
RUN mkdir -p /home/agent/deps
COPY --chown=${AGENT_UID}:${AGENT_GID} deps/back /home/agent/deps/back
RUN cd /home/agent/deps/back && ./mvnw -q -B dependency:go-offline

COPY --chown=${AGENT_UID}:${AGENT_GID} deps/front /home/agent/deps/front
RUN cd /home/agent/deps/front && npm ci --no-audit --no-fund && rm -rf /home/agent/deps

WORKDIR /home/agent

# En modo worktree, Sandcastle monta el worktree de git en ${SANDBOX_REPO_DIR}
# y usa ese directorio como working dir al arrancar el contenedor.
ENTRYPOINT ["sleep", "infinity"]
