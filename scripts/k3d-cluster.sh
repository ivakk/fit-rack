#!/usr/bin/env bash
# Create a local k3d cluster for FiTrack (requires k3d + kubectl).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CLUSTER_NAME="${K3D_CLUSTER_NAME:-fitrack}"

if k3d cluster list 2>/dev/null | grep -q "^${CLUSTER_NAME} "; then
  echo "k3d cluster '${CLUSTER_NAME}' already exists."
  kubectl config use-context "k3d-${CLUSTER_NAME}" 2>/dev/null || true
  exit 0
fi

if ! command -v k3d >/dev/null 2>&1; then
  echo "k3d is not installed. See https://k3d.io/"
  exit 1
fi

echo "Creating k3d cluster '${CLUSTER_NAME}' (API :80, Traefik dashboard :8090)..."
k3d cluster create "${CLUSTER_NAME}" \
  --agents 1 \
  -p "80:80@loadbalancer" \
  -p "8090:8080@loadbalancer" \
  --wait

kubectl config use-context "k3d-${CLUSTER_NAME}"

echo "Installing metrics-server (required for HPA)..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]' \
  2>/dev/null || true

echo "k3d cluster ready: k3d-${CLUSTER_NAME}"
