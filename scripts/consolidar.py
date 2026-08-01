import json, unicodedata, re

FILES = [
    ("perfiles_primer_ciclo.json", 1),
    ("perfiles_segundo_ciclo.json", 2),
    ("perfiles_tercer_ciclo.json", 3),
    ("perfiles_cuarto_ciclo.json", 4),
    ("perfiles_quinto_ciclo.json", 5),
    ("perfiles_sexto_ciclo.json", 6),
]

def norm(s):
    s = s.strip()
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'\s+', ' ', s).lower()
    return s

cursos = {}      # norm(nombre) -> {nombre, carrera, ciclo_ref}
profesores = {}  # norm(nombre) -> nombre (canonico = primera aparicion)
perfiles = {}    # (norm(curso), norm(profesor)) -> dict con datos + ciclo_origen

warnings = []

def add_curso(nombre, carrera, ciclo):
    k = norm(nombre)
    if k not in cursos:
        cursos[k] = {"nombre": nombre, "carrera": carrera, "ciclo_ref": ciclo}
    else:
        # si ya existe y el nuevo trae carrera no nula y el viejo es nula, actualiza
        if cursos[k]["carrera"] is None and carrera is not None:
            cursos[k]["carrera"] = carrera

def add_profesor(nombre):
    k = norm(nombre)
    if k not in profesores:
        profesores[k] = nombre
    return profesores[k]

def upsert_perfil(curso_nombre, profesor_nombre, data, ciclo_origen):
    ck, pk = norm(curso_nombre), norm(profesor_nombre)
    key = (ck, pk)
    if key not in perfiles and (ck not in cursos):
        warnings.append(f"Perfil para curso no registrado en cursos_nuevos: '{curso_nombre}' / '{profesor_nombre}' (ciclo {ciclo_origen})")
    perfiles[key] = {
        "curso": cursos.get(ck, {}).get("nombre", curso_nombre),
        "profesor": add_profesor(profesor_nombre),
        "resumen": data["resumen"],
        "que_esperar": data["que_esperar"],
        "exigencia": data["exigencia"],
        "carga_trabajo": data["carga_trabajo"],
        "ritmo": data["ritmo"],
        "claridad": data["claridad"],
        "recomendaciones": data["recomendaciones"],
        "ciclo_origen": ciclo_origen,
    }

for fname, ciclo_num in FILES:
    d = json.load(open(fname, encoding="utf-8"))

    for c in d.get("cursos_nuevos", []):
        add_curso(c["nombre"], c.get("carrera"), c.get("ciclo", ciclo_num))

    for c in d.get("cursos", []):  # ciclo1 usa la clave "cursos" en vez de "cursos_nuevos"
        add_curso(c["nombre"], c.get("carrera"), c.get("ciclo", ciclo_num))

    for p in d.get("perfiles", []):
        upsert_perfil(p["curso"], p["profesor"], p, ciclo_num)

    for curso_nombre, act in d.get("actualizaciones_cursos_existentes", {}).items():
        for p in act.get("perfiles_actualizados", []):
            upsert_perfil(curso_nombre, p["profesor"], p, ciclo_num)
        for p in act.get("perfiles_nuevos", []):
            upsert_perfil(curso_nombre, p["profesor"], p, ciclo_num)

print("=== RESUMEN ===")
print("cursos únicos:", len(cursos))
print("profesores únicos:", len(profesores))
print("perfiles (profesor+curso) únicos:", len(perfiles))
print()
if warnings:
    print("=== WARNINGS ===")
    for w in warnings:
        print("-", w)
    print()

# Guardar consolidado
out = {
    "cursos": list(cursos.values()),
    "profesores": list(profesores.values()),
    "perfiles": list(perfiles.values()),
}
json.dump(out, open("consolidado.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("Escrito consolidado.json")

# Detectar posibles casi-duplicados de profesores (mismo apellido/nombre parcial)
names = sorted(profesores.values())
print()
print("=== Posibles casi-duplicados a revisar ===")
for i in range(len(names)):
    for j in range(i+1, len(names)):
        a, b = names[i], names[j]
        na, nb = norm(a), norm(b)
        wa, wb = set(na.split()), set(nb.split())
        if na != nb and (wa & wb) and (wa <= wb or wb <= wa):
            print(f"- '{a}'  <->  '{b}'")
