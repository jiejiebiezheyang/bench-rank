#!/usr/bin/env bash
#
# BenchRank 服务器一键部署脚本 (Linux / macOS)
#
# 功能:
#   1. git pull 拉取最新代码
#   2. 清理旧的 Next.js 服务进程 (PID 文件 + 端口兜底)
#   3. 使用 Python venv 生成 data/benchmarks.json
#   4. npm install + 生产构建
#   5. 后台启动生产服务并做健康检查
#
# 用法:
#   ./deploy.sh                 # 使用默认配置 (端口 3000)
#   PORT=8080 ./deploy.sh       # 指定端口
#   VENV_DIR=/opt/benchrank-venv ./deploy.sh   # 指定 venv 路径
#
set -euo pipefail

# ============ 可配置项 ============
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-3001}"
PYTHON="${PYTHON:-python3}"
VENV_DIR="${VENV_DIR:-$APP_DIR/.venv}"
PID_FILE="${PID_FILE:-$APP_DIR/.server.pid}"
LOG_FILE="${LOG_FILE:-$APP_DIR/.server.log}"
# ==================================

log() { echo "[deploy] $*"; }

cd "$APP_DIR"

# ---------- 1. git 更新 ----------
if [[ -d .git ]]; then
  log "git pull 拉取最新代码 ..."
  git pull --ff-only
else
  log "未检测到 .git 目录,跳过 git pull"
fi

# ---------- 2. 清理旧进程 ----------
stop_old_server() {
  # 2a. 优先使用上次记录的 PID 文件
  if [[ -f "$PID_FILE" ]]; then
    local old_pid
    old_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
      log "停止旧服务进程 (pid $old_pid) ..."
      kill "$old_pid" 2>/dev/null || true
      for _ in $(seq 1 20); do
        kill -0 "$old_pid" 2>/dev/null || break
        sleep 0.5
      done
      kill -9 "$old_pid" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi

  # 2b. 端口兜底:清理任何仍占用目标端口的进程
  local pids=""
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:"$PORT" 2>/dev/null || true)"
  elif command -v fuser >/dev/null 2>&1; then
    pids="$(fuser "$PORT"/tcp 2>/dev/null || true)"
  fi
  if [[ -n "$pids" ]]; then
    log "清理占用端口 $PORT 的进程: $pids"
    kill $pids 2>/dev/null || true
    sleep 1
  fi
}
stop_old_server

# ---------- 3. Python venv + 生成数据 ----------
# 目录存在但缺少 bin/activate 说明 venv 不完整(上次创建失败残留),需要重建
if [[ ! -d "$VENV_DIR" || ! -f "$VENV_DIR/bin/activate" ]]; then
  log "创建 Python venv: $VENV_DIR"
  rm -rf "$VENV_DIR"
  if ! "$PYTHON" -m venv "$VENV_DIR"; then
    log "错误: 创建 venv 失败。"
    log "  Ubuntu/Debian 通常需要先安装: apt install -y python3-venv"
    log "  或指定可用的 Python: PYTHON=/usr/bin/python3.11 ./deploy.sh"
    exit 1
  fi
fi
# shellcheck disable=SC1091
# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"

# 解析脚本只用 Python 标准库;若以后引入第三方依赖,在 data/requirements.txt 声明
if [[ -f "data/requirements.txt" ]]; then
  log "安装 Python 依赖 (data/requirements.txt) ..."
  pip install -r data/requirements.txt
fi

log "运行 parse_benchmarks.py 生成 data/benchmarks.json ..."
# 脚本内部以相对路径 "benchmarks.json" 输出,须在 data/ 目录下执行
( cd data && python parse_benchmarks.py )

# ---------- 4. npm 安装 + 生产构建 ----------
log "npm install ..."
npm install

log "npm run build (生产构建) ..."
npm run build

# ---------- 5. 启动生产服务 ----------
log "启动生产服务,端口 $PORT ..."
# 直接使用 next 可执行文件,确保记录的 PID 就是实际服务进程,便于下次清理
nohup npx next start -p "$PORT" -H 0.0.0.0 >"$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
SERVER_PID="$!"

# 健康检查
for i in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
    log "部署完成: http://<服务器IP>:$PORT (pid $SERVER_PID, 日志: $LOG_FILE)"
    exit 0
  fi
  sleep 0.5
done

log "警告: 服务启动后健康检查未通过,请查看日志 $LOG_FILE"
exit 1
