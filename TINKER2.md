# tinker2_meshcore-webui

Fork de https://github.com/adradr/meshcore-webui para uso no Tinker Board 2.
Preparação inicial: 09/11/2026, baseada no upstream 94dcc3d845dd09be03896694de2190e39a020086.

## Companion de destino

- Heitor, Heltec V3, TCP 192.168.100.213:5000.
- Chave pública: 4AF1FB20D3AD93DE1501322E0C1BD0ABE5B3A3071218ADB78E429E0158E9E3E3.
- O companion teste antena (.222) permanece na coleta do meshcoreSDR e não é o destino desta interface.
- O backend conecta ao TCP; o navegador usa HTTP/WebSocket com o backend.

## Estado

Fork e checkout criados. Configuração local .env prepara o endpoint do Heitor.
Nenhum serviço instalado ou iniciado, nenhuma conexão persistente com o Heitor.
Não foram instalados Docker, dependências Python ou frontend nesta preparação.

## Requisitos identificados

O backend exige Python >=3.12; o Python padrão do Debian Bullseye é 3.9.
Uma instalação nativa precisará de um interpretador isolado compatível, venv,
compilação do frontend e serviço systemd. A aplicação pode funcionar sem Docker;
a instalação nativa ainda precisa ser preparada e validada.

Antes da ativação, definir porta HTTP disponível, orçamento de memória e retenção
dos dados da aplicação. O backend mantém contatos/mensagens no SQLite por padrão.
O Heltec aceita um cliente TCP: a interface web ocupará essa conexão enquanto
ativa. BLE é uma interface separada no firmware atual.

## Git

origin: PU5MFH/tinker2_meshcore-webui
upstream: adradr/meshcore-webui

Segredos, .env e bancos locais permanecem fora do Git.
