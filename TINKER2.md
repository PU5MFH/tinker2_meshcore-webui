# tinker2_meshcore-webui — instalação nativa

Fork de https://github.com/adradr/meshcore-webui para o Tinker Board 2.
Base upstream: 94dcc3d845dd09be03896694de2190e39a020086.
Implantação: 09/11/2026.

## Acesso e companion

http://192.168.100.224:8090/

O servidor no Tinker conecta ao Heitor, Heltec V3, em 192.168.100.213:5000.
Chave pública: 4AF1FB20D3AD93DE1501322E0C1BD0ABE5B3A3071218ADB78E429E0158E9E3E3.
O teste antena .222 continua na coleta do meshcoreSDR.
O navegador usa HTTP/WebSocket; o backend mantém uma conexão TCP ao Heitor.
Essa conexão ocupa o cliente TCP disponível do Heitor. BLE é interface separada.

## Runtime e limites

- Serviço: tinker2-meshcore-webui.service, usuário meshcorewebui.
- Instalação: /opt/tinker2-meshcore-webui.
- Python 3.12.16 ARM64 isolado e venv com o backend/uv.lock.
- Python 3.9 do Debian preservado; Docker não instalado.
- Um worker uvicorn, MemoryHigh=320MiB, MemoryMax=384MiB.
- Poll de ruído a cada 10 segundos.
- Configuração: /etc/tinker2-meshcore-webui/webui.env.
- Chaves VAPID fora do Git em /etc/tinker2-meshcore-webui.
- Serviço habilitado no boot, reinício automático em falha.

Arquivos de implantação estão em deployment/. O .env local do checkout é apenas
um exemplo para desenvolvimento/Compose; a instalação systemd usa o arquivo
em /etc.

## Logs e dados

Saída operacional no journal, que já está sob log2ram. SQLite, WAL/SHM, RX Log,
cache de mapa e anexos ficam em /var/log/tinker2-meshcore-webui, também no log2ram.
Como o RX Log e as mensagens usam o mesmo banco upstream, o banco completo
foi colocado nesse local. O log2ram pode sincronizá-lo ao disco segundo sua
política existente; não é um volume descartável independente.

Buffer RX: 1.000 entradas; persistência ativada com cap de 1.000 linhas, aplicada
periodicamente pelo serviço de retenção upstream, podendo ultrapassar
temporariamente o cap entre limpezas. Anexos: 5MiB por arquivo, quota 20MiB.
Chaves não ficam em /var/log. A URL pública dos anexos nesta instalação é apenas
a URL da LAN, não um endereço acessível pela internet.

## Frontend e build

Node 22.23.4 ARM64 e pnpm 10.34.9 foram usados somente para compilar.
SHASUMS256 oficial do Node validado antes de extrair.
Instalação de pacotes com lock congelado e scripts de instalação desativados.
deployment/build-frontend.sh executa TypeScript, Vite/PWA e verifica ausência
de devtools no bundle de produção. Frontend final em /opt/tinker2-meshcore-webui/static.

O primeiro build com heap JS de 384MiB ficou sem heap no TypeScript. O build
concluiu com heap de 512MiB e cgroup temporário de 768MiB; isso não altera o
limite de 384MiB do serviço em operação. node_modules e ferramentas temporárias
podem ser removidos após o build: Node não integra o runtime do servidor.
Para recompilar, disponibilizar Node compatível e instalar as dependências
de frontend/pnpm-lock.yaml antes de executar o script.

## Correção para HTTP na LAN

O envio original gerava IDs otimistas com crypto.randomUUID(), API restrita
a contextos seguros. Em http://IP o hook falhava antes de fazer POST /api/messages.
clientMessageId usa a implementação nativa quando disponível e UUIDv4 baseado em
crypto.getRandomValues quando não. Isso afeta apenas IDs da interface, não
identidades/chaves do MeshCore. Teste de regressão simula o ambiente HTTP e
confirma que a mutação chega à API. Recarregar a página após a atualização.

## Verificação e operação

- TypeScript e build Vite/PWA concluídos; bundle de produção sem devtools.
- Testes de UUID nativo e envio sem randomUUID passaram (2 testes).
- uv pip check: 55 pacotes compatíveis.
- Página, JS/CSS, health/deep e WebSocket ping/pong verificados.
- Após a correção HTTP, novo bundle servido (index-DDoH8WhR.js).
- Nenhuma mensagem real enviada durante o teste automatizado da correção.
- self-info confirmou Heitor e configuração 923.125/SF8/BW62.5/CR8.
- RX Log recebendo eventos; banco confirmado em tmpfs log2ram.
- Consumo inicial aproximadamente 117–122MiB, zero reinícios.

sudo systemctl status tinker2-meshcore-webui.service
sudo journalctl -u tinker2-meshcore-webui.service -n 30 --no-pager
curl http://192.168.100.224:8090/api/health/deep

## Git

origin: PU5MFH/tinker2_meshcore-webui
upstream: adradr/meshcore-webui

Segredos, .env, bancos, dependências e arquivos compilados ficam fora do Git.


## Texto de mensagens sem prefixo automático

Por solicitação do operador, send_chan_msg transmite exatamente o texto
digitado. A prévia otimista também não acrescenta o nome do companion.
Prefixos digitados manualmente são preservados. Validação: três casos do envio
no backend (texto simples, prefixo manual e Unicode/múltiplas linhas), dois
testes do hook HTTP incluindo a prévia com self-info Heitor, e build de produção.
Nenhuma mensagem RF foi enviada por esses testes.
