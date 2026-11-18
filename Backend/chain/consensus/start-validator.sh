#!/bin/sh
set -eu

if [ ! -d /data/geth ]; then
  geth init --datadir /data /consensus/genesis.json
  geth account import --datadir /data --password /consensus/password.txt "/consensus/keys/${VALIDATOR_NAME}.key"
fi

mkdir -p /data/geth
printf '%s\n' "$NODE_KEY" > /data/geth/nodekey

nodes=""
oldifs=$IFS
IFS=,
for peer in $PEERS; do
  name=${peer%%:*}
  pub=${peer#*:}
  ip=""
  attempt=0
  while [ -z "$ip" ] && [ "$attempt" -lt 30 ]; do
    ip=$(getent hosts "$name" | awk '{print $1; exit}')
    if [ -z "$ip" ]; then
      attempt=$((attempt + 1))
      sleep 1
    fi
  done
  nodes="${nodes}enode://${pub}@${ip}:30303,"
done
IFS=$oldifs
BOOTNODES=${nodes%,}
{
  printf '%s\n' '[Node.P2P]' 'NoDiscovery = true' 'StaticNodes = ['
  oldifs=$IFS
  IFS=,
  for url in $BOOTNODES; do
    printf '  "%s",\n' "$url"
  done
  IFS=$oldifs
  printf '%s\n' ']'
} > /data/config.toml

IP=$(hostname -i | awk '{print $1}')

exec geth \
  --config /data/config.toml \
  --datadir /data \
  --networkid 31337 \
  --port 30303 \
  --nat "extip:${IP}" \
  --nodiscover \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 8545 \
  --http.api "$HTTP_API" \
  --http.vhosts "*" \
  --http.corsdomain "*" \
  --authrpc.addr 127.0.0.1 \
  --authrpc.port 8551 \
  --unlock "$VALIDATOR_ADDRESS" \
  --password /consensus/password.txt \
  --allow-insecure-unlock \
  --mine \
  --miner.etherbase "$VALIDATOR_ADDRESS" \
  --syncmode full \
  --verbosity 3
