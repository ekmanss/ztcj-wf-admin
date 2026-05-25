# 服务器部署说明

## 当前部署信息

- 服务器公网 IP：`43.198.240.209`
- 仓库目录：`/home/ubuntu/repo/ztcj-wf-admin`
- 前端静态目录：`/var/www/ztcj-wf-admin`
- 前端访问地址：`http://43.198.240.209:8080`
- API 本机端口：`3001`
- API health check：`http://127.0.0.1:3001/api/health`
- nginx 代理 health check：`http://127.0.0.1:8080/api/health`

## nginx 配置

当前生效的 nginx 不是 `/etc/nginx/nginx.conf`，而是：

```bash
/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
```

站点配置文件：

```bash
/usr/local/nginx/conf/vhost/ztcj-wf-admin.conf
```

当前站点监听 `8080`，将前端静态文件指向 `/var/www/ztcj-wf-admin`，并把
`/api/` 反向代理到 `http://127.0.0.1:3001`。

检查和重载 nginx：

```bash
sudo /usr/local/nginx/sbin/nginx -t -c /usr/local/nginx/conf/nginx.conf
sudo systemctl restart nginx
```

## 环境变量

根目录 `.env` 用于 API：

```bash
/home/ubuntu/repo/ztcj-wf-admin/.env
```

需要包含：

```bash
DATABASE_URL=mysql://...
PORT=3001
VITE_API_BASE_URL=/api
VITE_DEV_AUTH_ENABLED=false
```

前端生产构建建议使用：

```bash
/home/ubuntu/repo/ztcj-wf-admin/apps/admin/.env.production
```

内容：

```bash
VITE_API_BASE_URL=/api
VITE_DEV_AUTH_ENABLED=false
```

注意：`VITE_*` 变量会在 `mise run build` 时写入前端静态产物，修改后必须重新构建并复制 `dist`。

不要把数据库密码、token、证书等 secret 写进文档或提交到 git。

## API 启动方式

API 使用 `tmux` 手动运行生产构建产物。

启动：

```bash
cd /home/ubuntu/repo/ztcj-wf-admin/apps/api
tmux new -s ztcj-wf-api
NODE_ENV=production mise exec -- node dist/main.js
```

保持运行并退出 tmux：

```text
Ctrl+b
d
```

查看：

```bash
tmux ls
tmux attach -t ztcj-wf-api
```

停止：

```bash
tmux kill-session -t ztcj-wf-api
```

服务器重启后，`tmux` 中的 API 不会自动恢复，需要手动重新启动。

## 首次或完整部署

```bash
cd /home/ubuntu/repo/ztcj-wf-admin
mise trust
mise install
mise run install
mise run build

sudo mkdir -p /var/www/ztcj-wf-admin
sudo rsync -a --delete apps/admin/dist/ /var/www/ztcj-wf-admin/

sudo /usr/local/nginx/sbin/nginx -t -c /usr/local/nginx/conf/nginx.conf
sudo systemctl restart nginx
```

然后启动 API：

```bash
cd /home/ubuntu/repo/ztcj-wf-admin/apps/api
tmux new -s ztcj-wf-api
NODE_ENV=production mise exec -- node dist/main.js
```

验证：

```bash
curl -i http://127.0.0.1:3001/api/health
curl -I http://127.0.0.1:8080
curl -i http://127.0.0.1:8080/api/health
```

## 更新代码后重部署

```bash
cd /home/ubuntu/repo/ztcj-wf-admin
git pull --ff-only
mise run install
mise run build
sudo rsync -a --delete apps/admin/dist/ /var/www/ztcj-wf-admin/
sudo /usr/local/nginx/sbin/nginx -t -c /usr/local/nginx/conf/nginx.conf
sudo systemctl restart nginx
```

如果 API 代码有更新，重启 tmux 中的 API：

```bash
tmux kill-session -t ztcj-wf-api
cd /home/ubuntu/repo/ztcj-wf-admin/apps/api
tmux new -s ztcj-wf-api
NODE_ENV=production mise exec -- node dist/main.js
```

## 常见检查

确认 nginx 监听端口：

```bash
sudo ss -ltnp | grep nginx
```

确认前端产物没有写死 localhost API：

```bash
grep -R "localhost:3001" -n /var/www/ztcj-wf-admin || echo "ok: no localhost api url"
```

查看 API 日志：

```bash
tmux attach -t ztcj-wf-api
```

