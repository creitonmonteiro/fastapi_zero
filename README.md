# Task Manager

## CI/CD (GitHub Actions)

O projeto possui pipeline completo em `.github/workflows/pipeline.yaml` com 3 estagios:

- Test: instala dependencias via Poetry e executa testes com cobertura.
- Build/Push: gera imagem Docker, publica com tags `sha-<commit>` e `latest` no Docker Hub.
- Deploy: aplica `k8s-app.yaml`, atualiza a imagem no Deployment e aguarda rollout.

### Secrets necessarios no GitHub

- `DATABASE_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `KUBE_CONFIG_DATA` (kubeconfig em base64)

### Como gerar KUBE_CONFIG_DATA

No seu ambiente local:

```bash
cat ~/.kube/config | base64 -w 0
```

No Windows PowerShell:

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content "$HOME/.kube/config" -Raw)))
```

Copie a saida e salve no secret `KUBE_CONFIG_DATA` do repositorio.

## Monitoring

Prometheus e Grafana podem ser aplicados no mesmo namespace com:

```bash
kubectl apply -f monitoring/prometheus.yaml
kubectl apply -f monitoring/grafana.yaml
kubectl apply -f monitoring/networkpolicy.yaml
```

Depois disso, os acessos padrao sao:

- Grafana: `http://localhost:30300`

O Prometheus fica acessivel apenas dentro do cluster (ClusterIP). Para acessar localmente para debug:

```bash
kubectl -n task-manager port-forward svc/prometheus-service 39090:9090
```

Depois abra `http://localhost:39090`.

## NetworkPolicy

As politicas em `monitoring/networkpolicy.yaml` aplicam os seguintes controles:

- Bloqueio padrao de ingress/egress para pods `prometheus` e `grafana`.
- Grafana aceita ingress somente na porta `3000`.
- Prometheus aceita ingress somente a partir do pod `grafana` na porta `9090`.
- Prometheus so pode fazer egress para `task-manager-app` (`8000`) e DNS (`53`).
- Grafana so pode fazer egress para `prometheus` (`9090`) e DNS (`53`).

Credenciais iniciais do Grafana:

- Usuario: `admin`
- Senha: `admin`
