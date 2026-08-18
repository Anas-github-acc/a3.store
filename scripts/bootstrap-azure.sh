#!/usr/bin/env bash

set -euo pipefail


PROVIDERS=(
  Microsoft.ContainerService
  Microsoft.ContainerRegistry
  Microsoft.Monitor
  Microsoft.Dashboard
  Microsoft.Insights
  Microsoft.AlertsManagement
)


for provider in "${PROVIDERS[@]}"; do

  echo "Registering $provider ..."

  az provider register \
    --namespace "$provider" \
    >/dev/null

done


echo


for provider in "${PROVIDERS[@]}"; do

  for i in {1..60}; do

    state="$(
      az provider show \
        --namespace "$provider" \
        --query registrationState \
        -o tsv
    )"


    if [[ "$state" == "Registered" ]]; then

      printf '  %-30s %s\n' "$provider" "$state"

      break

    fi


    if [[ "$i" -eq 60 ]]; then

      echo "$provider did not reach Registered state in the expected window." >&2

      exit 1

    fi


    sleep 5

  done

done


echo

echo "Azure providers are registered."
