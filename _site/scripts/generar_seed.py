import json, unicodedata, re

d = json.load(open("consolidado.json", encoding="utf-8"))

def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s

def esc(s):
    if s is None:
        return "null"
    return "'" + str(s).replace("'", "''") + "'"

# desambiguar slugs duplicados (por si dos nombres distintos normalizan igual)
def make_unique_slugs(items, key):
    used = {}
    slugs = {}
    for it in items:
        base = slugify(it[key])
        s = base
        n = 2
        while s in used:
            s = f"{base}-{n}"
            n += 1
        used[s] = True
        slugs[it[key]] = s
    return slugs

curso_slugs = make_unique_slugs(d["cursos"], "nombre")
profesor_slugs = {}
used = {}
for nombre in d["profesores"]:
    base = slugify(nombre)
    s = base
    n = 2
    while s in used:
        s = f"{base}-{n}"
        n += 1
    used[s] = True
    profesor_slugs[nombre] = s

lines = []
lines.append("-- ============================================================")
lines.append("-- SIGA · Opiniones — Seed generado desde perfiles_*_ciclo.json")
lines.append(f"-- Cursos: {len(d['cursos'])} | Profesores: {len(d['profesores'])} | Perfiles: {len(d['perfiles'])}")
lines.append("-- ============================================================")
lines.append("")

# ---- cursos ----
lines.append("insert into cursos (nombre, codigo, carrera, ciclo_ref, slug) values")
vals = []
for c in d["cursos"]:
    vals.append(f"({esc(c['nombre'])}, null, {esc(c['carrera'])}, {c['ciclo_ref'] if c['ciclo_ref'] else 'null'}, {esc(curso_slugs[c['nombre']])})")
lines.append(",\n".join(vals) + ";")
lines.append("")

# ---- profesores ----
lines.append("insert into profesores (nombre, slug) values")
vals = []
for nombre in d["profesores"]:
    vals.append(f"({esc(nombre)}, {esc(profesor_slugs[nombre])})")
lines.append(",\n".join(vals) + ";")
lines.append("")

# ---- profesor_curso ----
lines.append("insert into profesor_curso (profesor_id, curso_id)")
selects = []
for p in d["perfiles"]:
    selects.append(
        f"select p.id, c.id from profesores p, cursos c where p.slug = {esc(profesor_slugs[p['profesor']])} and c.slug = {esc(curso_slugs[p['curso']])}"
    )
lines.append("\nunion all\n".join(selects) + ";")
lines.append("")

# ---- perfiles_profesor ----
lines.append("insert into perfiles_profesor (profesor_curso_id, resumen, que_esperar, exigencia, carga_trabajo, ritmo, claridad, recomendaciones, fuente)")
selects = []
for p in d["perfiles"]:
    fuente = 'nucleo_pdf' if p['ciclo_origen'] <= 5 else 'experiencia_propia' if p['ciclo_origen'] >= 7 else 'nucleo_pdf'
    # ciclo 6 (PDF de Nucleo, ya validado por Harry porque lo cursó) sigue siendo nucleo_pdf
    sel = (
        "select pc.id, "
        f"{esc(p['resumen'])}, {esc(p['que_esperar'])}, {p['exigencia']}, {p['carga_trabajo']}, {p['ritmo']}, {p['claridad']}, {esc(p['recomendaciones'])}, {esc(fuente)} "
        "from profesor_curso pc "
        "join profesores pr on pr.id = pc.profesor_id "
        "join cursos cu on cu.id = pc.curso_id "
        f"where pr.slug = {esc(profesor_slugs[p['profesor']])} and cu.slug = {esc(curso_slugs[p['curso']])}"
    )
    selects.append(sel)
lines.append("\nunion all\n".join(selects) + ";")
lines.append("")

open("seed.sql", "w", encoding="utf-8").write("\n".join(lines))
print("seed.sql generado.")
print("cursos:", len(d["cursos"]), "profesores:", len(d["profesores"]), "perfiles:", len(d["perfiles"]))
