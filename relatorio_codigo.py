import subprocess
import json
import os
import sys
from datetime import datetime, date, timezone
from collections import defaultdict
import statistics
import re

INCLUDE_EXTS = {".php", ".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".vue", ".py", ".dart", ".h", ".cpp", ".swift", ""}


def run_git(args):
    result = subprocess.run(
        ["git"] + args,
        capture_output=True,
        cwd=os.getcwd(),
        encoding="utf-8",
        errors="replace"
    )
    return result.stdout


def get_monthly_commits():
    output = run_git(["log", "--format=%H|%ai|%s"])
    by_month = {}
    for line in output.strip().split("\n"):
        if "|" not in line:
            continue
        parts = line.split("|")
        h = parts[0]
        date_str = parts[1]
        msg = "|".join(parts[2:])
        try:
            month = datetime.fromisoformat(date_str).strftime("%Y-%m")
        except:
            continue
        if month not in by_month:
            by_month[month] = {"hash": h, "msg": msg.strip(), "date": date_str}
    return by_month


def get_first_commit_date():
    output = run_git(["log", "--reverse", "--format=%ai"])
    lines = output.strip().split("\n")
    for line in lines:
        line = line.strip()
        if line:
            try:
                dt = datetime.fromisoformat(line)
                return dt.astimezone(timezone.utc).replace(tzinfo=None)
            except:
                continue
    return None


def detect_language(filepath, text):
    """Detecta linguagem por conteúdo/nome para arquivos sem extensão."""
    filename = os.path.basename(filepath).lower()

    # Nomes de arquivo bem conhecidos
    known_names = {
        "makefile": "Makefile",
        "dockerfile": "Dockerfile",
        "dockerfile.prod": "Dockerfile",
        "dockerfile.dev": "Dockerfile",
        "rakefile": ".rb",
        "gemfile": ".rb",
        "vagrantfile": ".rb",
        "brewfile": ".rb",
        "jenkinsfile": "Jenkinsfile",
        "cmakelists.txt": "CMake",
        "podfile": ".rb",
        "guardfile": ".rb",
        "capfile": ".rb",
        "thorfile": ".rb",
    }
    if filename in known_names:
        return known_names[filename]

    lines = text.split("\n", 5)
    if not lines:
        return ""

    first_line = lines[0].strip()

    # Shebang
    if first_line.startswith("#!"):
        cmd = first_line[2:].strip()
        parts = cmd.split()
        if len(parts) >= 2 and parts[0].endswith("env"):
            interpreter = parts[1].lower()
        elif parts:
            interpreter = os.path.basename(parts[0]).lower()
        else:
            interpreter = None

        shebang_map = {
            "python": ".py", "python3": ".py", "python2": ".py",
            "ruby": ".rb",
            "node": ".js", "nodejs": ".js",
            "bash": ".sh", "sh": ".sh", "zsh": ".sh", "fish": ".sh", "ksh": ".sh",
            "perl": ".pl", "perl5": ".pl",
            "php": ".php",
            "swift": ".swift",
            "dart": ".dart",
            "go": ".go",
            "rustc": ".rs", "rust": ".rs",
        }
        if interpreter in shebang_map:
            return shebang_map[interpreter]

    # Heurísticas por conteúdo (primeiras 5 linhas)
    sample = "\n".join(lines[:5])
    if "<?php" in sample or "<?=" in sample:
        return ".php"

    return ""


class GitCatFileBatch:
    """Processo persistente git cat-file --batch para eliminar overhead de subprocessos.

    Envia um SHA por vez e lê a resposta imediatamente para evitar deadlock de pipes
    no Windows quando o volume de dados excede o buffer interno do SO.
    """

    def __init__(self):
        self.proc = subprocess.Popen(
            ["git", "cat-file", "--batch"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

    def get_content(self, sha):
        self.proc.stdin.write(sha.encode() + b"\n")
        self.proc.stdin.flush()

        header = self.proc.stdout.readline()
        if not header:
            return None

        header_str = header.decode("ascii", errors="replace").strip()
        parts = header_str.split()

        if len(parts) < 3 or parts[1] == "missing":
            return None

        try:
            size = int(parts[2])
        except ValueError:
            return None

        content = self.proc.stdout.read(size)
        # trailing newline após o conteúdo
        self.proc.stdout.read(1)

        return content

    def close(self):
        if self.proc:
            self.proc.stdin.close()
            self.proc.wait(timeout=5)

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


def count_lines_at_commit(commit_hash, batch):
    files_output = run_git(["ls-tree", "-r", commit_hash])
    files = []
    for line in files_output.strip().split("\n"):
        if not line:
            continue
        parts = line.split("\t", 1)
        if len(parts) != 2:
            continue
        meta, filepath = parts
        meta_parts = meta.split()
        if len(meta_parts) < 3:
            continue
        sha = meta_parts[2]
        ext = os.path.splitext(filepath)[-1].lower()
        if ext not in INCLUDE_EXTS:
            continue
        files.append((sha, filepath, ext))

    total = 0
    files_by_ext = defaultdict(int)

    for sha, filepath, ext in files:
        content = batch.get_content(sha)
        if content is None:
            continue
        try:
            text = content.decode("utf-8", errors="replace")
        except Exception:
            continue
        lines = len(text.split("\n"))
        key = ext
        if key == "":
            detected = detect_language(filepath, text)
            if detected:
                key = detected
        files_by_ext[key] += lines
        total += lines

    return total, dict(files_by_ext)


def days_in_month(year, month):
    if month == 12:
        return 31
    return (date(year, month + 1, 1) - date(year, month, 1)).days


def progress_bar(current, total, prefix, bar_length=20):
    if total == 0:
        return ""
    filled = int(bar_length * current // total)
    bar = "#" * filled + "-" * (bar_length - filled)
    percent = 100 * current // total
    return f"\r{prefix} |{bar}| {percent}%"


def main():
    monthly = get_monthly_commits()

    if not monthly:
        print("Nenhum commit encontrado. Verifique se está numa pasta com repositório git.")
        return

    first_commit_dt = get_first_commit_date()
    today = datetime.now(timezone.utc).replace(tzinfo=None)

    report = []
    prev_total = 0

    print(f"{'Mês':<12} {'Total Linhas':>13}  {'Δ Linhas':>10}  {'Média/dia':>10}  {'Commit':<8}  Mensagem")
    print("-" * 90)

    months = sorted(monthly.keys())
    total_months = len(months)

    with GitCatFileBatch() as batch:
        for idx, month in enumerate(months, 1):
            info = monthly[month]
            sys.stdout.write(progress_bar(idx - 1, total_months, f"[{idx}/{total_months}] {month}"))
            sys.stdout.flush()

            total, by_ext = count_lines_at_commit(info["hash"], batch)

            year_m, mon_m = int(month.split("-")[0]), int(month.split("-")[1])
            dias = days_in_month(year_m, mon_m)

            delta = total - prev_total
            media_dia = round(delta / dias, 1) if dias > 0 else 0

            report.append({
                "mes": month,
                "total_linhas": total,
                "delta_linhas": delta,
                "media_linhas_por_dia": media_dia,
                "dias_no_mes": dias,
                "por_extensao": by_ext,
                "commit": info["hash"][:7],
                "mensagem": info["msg"]
            })

            delta_str = f"+{delta:,}" if delta >= 0 else f"{delta:,}"
            print(f"\r{month:<12} {total:>13,}  {delta_str:>10}  {media_dia:>9.1f}  {info['hash'][:7]:<8}  {info['msg'][:38]}")

            prev_total = total

    sys.stdout.write(progress_bar(total_months, total_months, f"[{total_months}/{total_months}] Concluído"))
    sys.stdout.write("\n")
    sys.stdout.flush()

    # ---- Estatísticas ----
    deltas = [r["delta_linhas"] for r in report if r["delta_linhas"] != 0]
    medias_dia = [r["media_linhas_por_dia"] for r in report if r["media_linhas_por_dia"] != 0]

    media_mensal = round(statistics.mean(deltas), 1) if deltas else 0
    media_diaria_geral = round(statistics.mean(medias_dia), 1) if medias_dia else 0

    total_atual = report[-1]["total_linhas"] if report else 0
    previsao_proximos_12m = total_atual + round(media_mensal * 12)

    dias_desde_inicio = None
    media_dia_historica = None
    if first_commit_dt:
        dias_desde_inicio = (today - first_commit_dt).days
        if dias_desde_inicio > 0:
            media_dia_historica = round(total_atual / dias_desde_inicio, 1)

    print("\n" + "=" * 90)
    print("ESTATÍSTICAS")
    print("=" * 90)
    print(f"  Total atual de linhas        : {total_atual:,}")
    if dias_desde_inicio:
        print(f"  Dias desde o 1º commit       : {dias_desde_inicio} dias")
    if media_dia_historica:
        print(f"  Média histórica (total/dias) : {media_dia_historica} linhas/dia")
    print(f"  Média de variação mensal     : {media_mensal:+,.1f} linhas/mês")
    print(f"  Média de variação diária     : {media_diaria_geral:+.1f} linhas/dia")
    print(f"  Previsão daqui a 12 meses    : ~{previsao_proximos_12m:,} linhas")
    print(f"  (baseado na média dos últimos {len(deltas)} meses)")
    print("=" * 90)

    stats = {
        "total_atual": total_atual,
        "media_variacao_mensal": media_mensal,
        "media_variacao_diaria": media_diaria_geral,
        "previsao_12_meses": previsao_proximos_12m,
        "meses_analisados": len(deltas),
        "primeiro_commit": first_commit_dt.isoformat() if first_commit_dt else None,
        "dias_desde_inicio": dias_desde_inicio,
        "media_historica_linhas_por_dia": media_dia_historica
    }

    output = {"relatorio": report, "estatisticas": stats}

    with open("relatorio_mensal.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("\nRelatório salvo em relatorio_mensal.json")


if __name__ == "__main__":
    main()
