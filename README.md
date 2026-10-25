# Inteligencia Artificial I — UStudyOpen

Sitio académico autónomo desarrollado con Quarto. Cubre el alcance actualmente disponible: fundamentos de aprendizaje de máquina, representación de datos, generalización, árboles de decisión, máquinas de vectores de soporte y fundamentos de aprendizaje por refuerzo.

## Requisitos y uso local

Se requiere [Quarto CLI](https://quarto.org/) instalado.

```bash
quarto preview
```

Para generar el sitio completo:

```bash
quarto render
```

El render actual se escribe en `_site/`, ignorado por Git. `docs/` conserva la publicación anterior hasta una migración autorizada; no regenerarlo ni retirarlo anticipadamente.

## Estructura

- `fundamentos/`: IA, aprendizaje inductivo y componentes de un sistema de ML.
- `datos/`: representación, generalización y selección de modelos.
- `supervisado/`: árboles de decisión y familia SVM.
- `refuerzo/`: agentes, MDP, retorno y políticas.
- `references.bib`: bibliografía académica de apoyo.
- `_extensions/ustudyopen-design/`: versión compartida de identidad y componentes.
- `assets/css/visualizaciones.css`: geometría y colores semánticos de actividades. Los antiguos CSS generales y `theme.scss` quedan como referencia inactiva.

## Criterios editoriales

El contenido se organiza por conceptos, no por clases. Las páginas son autocontenidas, conservan la terminología técnica en español e inglés cuando resulta útil y enlazan definiciones relacionadas para evitar repeticiones.

Usa `$...$` para matemática inline y `$$` para bloques. Antes de publicar, ejecuta `quarto render`, comprueba enlaces y citas, y ejecuta `python3 tests/platform_validate.py` contra `_site/`.


## Arquitectura compartida y revisión local

Quarto **1.10.18**, Python **3.14.8** y Node **24.21.0** en CI. No se instalan paquetes npm ni Python para compilar. El diseño usa una instantánea local **0.3.0**, con correcciones visuales 0.2 preservadas y archivos fijados por SHA-256. Los manifiestos de diseño y plataforma permiten verificar exactamente qué se instala. Las instrucciones previas sobre el piloto son históricas; la integración actual genera exclusivamente `_site/`.

```sh
python3 tests/render_clean.py
python3 tests/run_course.py
python3 tests/platform_validate.py
quarto preview --host 127.0.0.1
```

`tests/run_course.py` ejecuta las pruebas particulares disponibles. En IA y Precálculo incluye actividades reales mediante Chrome/Chromium con sandbox y Node WebSocket, sin paquetes; puede configurarse `BROWSER_EXECUTABLE`. Se usa un perfil desechable y servidor exclusivo en loopback. El render aislado conserva el `_site/` anterior si falla. Para examinar exactamente el artefacto generado sin volver a compilar: `python3 -m http.server 8761 --bind 127.0.0.1 --directory _site` y abrir `http://127.0.0.1:8761/`.

Los estados `lista`, `en-desarrollo` y `proximamente` se declaran en metadatos de página y en `course.yml` (JSON válido como YAML). El temario registra todas las páginas actuales y los temas futuros que ya estaban anunciados, cuando existen. No se inventa un programa institucional. `reference_code: null` significa que no se verificó un código oficial. No se marca revisión académica automáticamente. Para agregar una página: conservar las rutas existentes, declarar sus metadatos, agregarla al registro, al render y a la navegación, y revisar sus recursos; no crear secciones vacías. Los manifiestos de integridad se actualizan únicamente con revisión humana del contenido.

Para actualizar el sistema compartido: desde `../ustudyopen-design`, ejecutar `python3 tooling/sync_course.py ../inteligencia-artificial`, revisar ambos manifiestos y diferencias y repetir las pruebas y comparaciones visuales. No editar copias vendor. La plantilla solo inicia cursos nuevos; no migra los existentes.

Los workflows están preparados y no se activan por push. La publicación requiere autorización, protección de `main`, revisión del entorno `github-pages`, variable de activación y confirmación manual. [MIGRATION.md](MIGRATION.md) registra la situación remota verificada, los pasos exactos de activación posterior y la reversión. No se han realizado commits, pushes, tags, releases ni despliegues.

## Licencias

Véanse [alcance](LICENSING.md) y [avisos de terceros](THIRD-PARTY-NOTICES.md).
