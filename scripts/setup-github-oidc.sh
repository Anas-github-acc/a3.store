#!/usr/bin/env bash

set -euo pipefail


TF_DIR="${TF_DIR:-infra/terraform/azure}"

GITHUB_REPO="${GITHUB_REPO:-Anas-github-acc/a3.store}"

GITHUB_ENVIRONMENT="${GITHUB_ENVIRONMENT:-azure-portfolio}"

APP_NAME="${APP_NAME:-a3store-github-actions}"

FEDERATED_CREDENTIAL_NAME="${FEDERATED_CREDENTIAL_NAME:-github-azure-portfolio}"


command -v az >/dev/null || {
  echo "az CLI is required" >&2
  exit 1
}


command -v terraform >/dev/null || {
  echo "terraform is required" >&2
  exit 1
}


SUBSCRIPTION_ID="$(
  az account show \
    --query id \
    -o tsv
)"


TENANT_ID="$(
  az account show \
    --query tenantId \
    -o tsv
)"


ACR_ID="$(
  terraform \
    -chdir="$TF_DIR" \
    output \
    -raw acr_id
)"


ACR_NAME="$(
  terraform \
    -chdir="$TF_DIR" \
    output \
    -raw acr_name
)"


AKS_ID="$(
  terraform \
    -chdir="$TF_DIR" \
    output \
    -raw aks_id
)"


APP_ID="$(
  az ad app list \
    --display-name "$APP_NAME" \
    --query '[0].appId' \
    -o tsv
)"


if [[ -z "$APP_ID" ]]; then

  echo "Creating Microsoft Entra application: $APP_NAME"


  APP_ID="$(
    az ad app create \
      --display-name "$APP_NAME" \
      --query appId \
      -o tsv
  )"

else

  echo "Using existing Microsoft Entra application: $APP_NAME"

fi


APP_OBJECT_ID="$(
  az ad app show \
    --id "$APP_ID" \
    --query id \
    -o tsv
)"


SP_OBJECT_ID="$(
  az ad sp show \
    --id "$APP_ID" \
    --query id \
    -o tsv \
    2>/dev/null || true
)"


if [[ -z "$SP_OBJECT_ID" ]]; then

  echo "Creating service principal for $APP_NAME"


  az ad sp create \
    --id "$APP_ID" \
    >/dev/null


  for i in {1..12}; do

    SP_OBJECT_ID="$(
      az ad sp show \
        --id "$APP_ID" \
        --query id \
        -o tsv \
        2>/dev/null || true
    )"


    [[ -n "$SP_OBJECT_ID" ]] && break


    sleep 5

  done

fi


if [[ -z "$SP_OBJECT_ID" ]]; then

  echo "Could not resolve service principal object ID." >&2

  exit 1

fi


SUBJECT="repo:${GITHUB_REPO}:environment:${GITHUB_ENVIRONMENT}"


EXISTING_FED="$(
  az ad app federated-credential list \
    --id "$APP_OBJECT_ID" \
    --query "[?name=='$FEDERATED_CREDENTIAL_NAME'].name | [0]" \
    -o tsv
)"


if [[ -z "$EXISTING_FED" ]]; then

  FED_FILE="$(mktemp)"


  trap 'rm -f "$FED_FILE"' EXIT


  cat > "$FED_FILE" <<JSON
{
  "name": "$FEDERATED_CREDENTIAL_NAME",
  "issuer": "https://token.actions.githubusercontent.com/",
  "subject": "$SUBJECT",
  "description": "GitHub Actions OIDC for a3.store Azure portfolio deployment",
  "audiences": [
    "api://AzureADTokenExchange"
  ]
}
JSON


  echo "Creating federated credential for subject:"

  echo "  $SUBJECT"


  az ad app federated-credential create \
    --id "$APP_OBJECT_ID" \
    --parameters "$FED_FILE" \
    >/dev/null

else

  echo "Federated credential already exists: $FEDERATED_CREDENTIAL_NAME"

fi


ensure_role() {

  local role="$1"

  local scope="$2"


  local existing


  existing="$(
    az role assignment list \
      --assignee-object-id "$SP_OBJECT_ID" \
      --scope "$scope" \
      --query "[?roleDefinitionName=='$role'].id | [0]" \
      -o tsv
  )"


  if [[ -z "$existing" ]]; then

    echo "Assigning '$role'"


    az role assignment create \
      --assignee-object-id "$SP_OBJECT_ID" \
      --assignee-principal-type ServicePrincipal \
      --role "$role" \
      --scope "$scope" \
      >/dev/null

  else

    echo "Role already assigned: $role"

  fi
}


ensure_role \
  "AcrPush" \
  "$ACR_ID"


ensure_role \
  "Azure Kubernetes Service Cluster User Role" \
  "$AKS_ID"


echo

echo "======================================"
echo " GitHub Actions configuration"
echo "======================================"

echo

echo "Create GitHub environment:"

echo "  $GITHUB_ENVIRONMENT"

echo

echo "Create these GitHub secrets:"

echo

echo "AZURE_CLIENT_ID=$APP_ID"

echo "AZURE_TENANT_ID=$TENANT_ID"

echo "AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"

echo

echo "Create this repository variable:"

echo

echo "AZURE_ACR_NAME=$ACR_NAME"

echo

echo "Federated OIDC subject:"

echo

echo "$SUBJECT"
