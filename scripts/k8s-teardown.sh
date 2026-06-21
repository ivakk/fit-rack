#!/usr/bin/env bash
# Remove FiTrack Helm release (keeps k3d cluster unless K3D_DELETE_CLUSTER=1).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RELEASE="${HELM_RELEASE:-fitrack}"
NAMESPACE="${K8S_NAMESPACE:-fitrack}"
CLUSTER="${K3D_CLUSTER_NAME:-fitrack}"

if command -v helm >/dev/null 2>&1; then
  helm uninstall "${RELEASE}" -n "${NAMESPACE}" 2>/dev/null || true
  kubectl delete namespace "${NAMESPACE}" --wait=false 2>/dev/null || true
fi

if [ "${K3D_DELETE_CLUSTER:-0}" = "1" ] && command -v k3d >/dev/null 2>&1; then
  k3d cluster delete "${CLUSTER}" 2>/dev/null || true
fi

echo "FiTrack Kubernetes resources removed."
