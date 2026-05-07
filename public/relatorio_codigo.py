import subprocess
import json
import os
from datetime import datetime, date, timezone
from collections import defaultdict
import statistics

INCLUDE_EXTS = {".php", ".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".vue", ".py"}

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

def count_lines_at_commit(commit_hash):
    files_output = run_git(["ls-tree", "-r", "--name-only", commit_hash])
    total = 0
    files_by_ext = defaultdict(int)

    for filepath in files_output.strip().split("\n"):
        ext = os.path.splitext(filepath)[-1].lower()
        if ext not in INCLUDE_EXTS:
            continue

        result = subprocess.run(
            ["git", "show", f"{commit_hash}:{filepath}"],
            capture_output=True,
            encoding="utf-8",
            errors="replace"
        )

        if result.returncode != 0 or not result.stdout:
            continue

        lines = len(result.stdout.split("\n"))
        files_by_ext[ext] += lines
        total += lines

    return total, dict(files_by_ext)

def days_in_month(year, month):
    if month == 12:
        return 31
    return (date(year, month + 1, 1) - date(year, month, 1)).days

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

    for month in sorted(monthly.keys()):
        info = monthly[month]
        total, by_ext = count_lines_at_commit(info["hash"])

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
        print(f"{month:<12} {total:>13,}  {delta_str:>10}  {media_dia:>9.1f}  {info['hash'][:7]:<8}  {info['msg'][:38]}")

        prev_total = total

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