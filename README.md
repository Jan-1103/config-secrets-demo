# Configuration & Secrets Demo (Kubernetes)

Frontend (nginx) -> Backend (Node.js) -> PostgreSQL

- Non-sensitive config -> ConfigMap `app-config` (k8s/01-configmap.yaml)
- Sensitive values (DB user, DB password, API key) -> Secret `app-secrets`,
  created with `kubectl create secret` so they are NEVER in GitHub, Dockerfiles or manifests.

## Run (PowerShell, inside this folder)
1. docker build -t YOUR_DOCKERHUB_USERNAME/config-backend:1.0 ./backend
2. docker build -t YOUR_DOCKERHUB_USERNAME/config-frontend:1.0 ./frontend
3. docker login ; docker push both images
4. Replace YOUR_DOCKERHUB_USERNAME in k8s/03-backend.yaml and k8s/04-frontend.yaml
5. kubectl apply -f k8s/00-namespace.yaml
6. kubectl create secret generic app-secrets -n config-demo --from-literal=DB_USER=<user> --from-literal=DB_PASSWORD=<password> --from-literal=API_KEY=<key>
7. kubectl apply -f k8s/01-configmap.yaml -f k8s/02-postgres.yaml -f k8s/03-backend.yaml -f k8s/04-frontend.yaml
8. kubectl get svc frontend -n config-demo   (open the EXTERNAL-IP in browser)
