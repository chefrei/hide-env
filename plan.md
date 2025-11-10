
---

### **Plan de Desarrollo: Extensión "Screen Safe" para VS Code**

**Concepto:** Una extensión que oculta visualmente el contenido de archivos sensibles (definidos en un archivo `.hide`) para prevenir la exposición accidental de claves y secretos durante la compartición de pantalla.

---

### **Fase 0: Preparación y Configuración del Entorno** - Listo

**Objetivo:** Instalar todas las herramientas necesarias para empezar a desarrollar.

**Programas a Descargar:** - Listo

1.  **Visual Studio Code:** El editor donde desarrollarás y probarás la extensión. [Descargar aquí](https://code.visualstudio.com/).
2.  **Node.js (versión LTS):** El entorno de ejecución para JavaScript/TypeScript. Incluye `npm`, el gestor de paquetes. [Descargar aquí](https://nodejs.org/).
3.  **Git:** El sistema de control de versiones para gestionar tu código. [Descargar aquí](https://git-scm.com/).

**Paquetes Globales de NPM a Instalar:** - Listo

Abre tu terminal o línea de comandos y ejecuta lo siguiente:

```bash
# Instala Yeoman (un generador de proyectos) y el generador específico para VS Code
npm install -g yo generator-code

# Instala vsce, la herramienta para empaquetar y publicar tu extensión (lo usarás al final)
npm install -g @vscode/vsce
```

---

### **Fase 1: Creación del Esqueleto del Proyecto (El "Hola Mundo")** - Listo

**Objetivo:** Generar el proyecto base y entender su estructura.

**Pasos a Seguir:**

1.  **Genera el Proyecto:** En tu terminal, navega a la carpeta donde quieres guardar tu proyecto y ejecuta:
    ```bash
    yo code
    ```
2.  **Responde las Preguntas:**
    *   `What type of extension do you want to create?` -> **New Extension (TypeScript)**
    *   `What's the name of your extension?` -> `Screen Safe` (o el nombre que prefieras)
    *   `What's the identifier of your extension?` -> `screen-safe`
    *   `What's the description of your extension?` -> `Oculta secretos en el editor para compartir pantalla de forma segura.`
    *   `Initialize a git repository?` -> **Yes**
    *   `Bundle the source code with webpack?` -> **No** (para empezar es más simple sin él)
    *   `Which package manager to use?` -> **npm**
3.  **Abre y Explora:** Abre la carpeta generada (`screen-safe`) en VS Code. Familiarízate con estos archivos:
    *   `package.json`: El manifiesto. Define el nombre, los eventos de activación, etc.
    *   `src/extension.ts`: El archivo principal donde vivirá toda tu lógica.
4.  **Prueba la Extensión Base:** Presiona **`F5`**. Se abrirá una nueva ventana de VS Code (llamada "Host de Desarrollo de Extensiones"). En esa ventana, abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`) y busca el comando `Hello World`. Si aparece un mensaje, ¡tu entorno funciona!

---

### **Fase 2: Lógica Principal - Leer y Analizar el Archivo `.hide`** - Pendiente

**Objetivo:** Implementar la capacidad de la extensión para encontrar y leer las reglas del archivo `.hide`.

**Pasos a Seguir:**

1.  **Activar la Extensión:** En `package.json`, cambia `"activationEvents"` para que tu extensión se active al iniciar VS Code y no solo con un comando.
    ```json
    "activationEvents": [
        "onStartupFinished"
    ]
    ```
2.  **Encontrar el Archivo `.hide`:** En `src/extension.ts`, dentro de la función `activate`, usa la API de VS Code para encontrar la carpeta raíz del proyecto y buscar el archivo `.hide`.
3.  **Leer y Procesar las Reglas:** Utiliza el módulo `fs` de Node.js para leer el contenido del archivo. Limpia las líneas vacías y los comentarios (`#`) para obtener una lista limpia de patrones de archivo (ej: `['*.env', 'secrets.json']`).

**Paquetes NPM a Instalar (en el proyecto):**

```bash
# Instala un paquete para hacer coincidir patrones de archivo fácilmente (como los de .gitignore)
npm install minimatch
```

---

### **Fase 3: La Magia Visual - Ocultar el Contenido Sensible** - Pendiente

**Objetivo:** Implementar la funcionalidad de ocultamiento visual usando la API de Decoraciones.

**Pasos a Seguir:**

1.  **Crear el Estilo de Decoración:** Define cómo se verá el texto oculto. Crea una constante `decorationType` usando `vscode.window.createTextEditorDecorationType`. Tu idea de usar asteriscos es perfecta.
    ```typescript
    const OcultarDecoracion = vscode.window.createTextEditorDecorationType({
        // Oculta el texto original
        textDecoration: 'none; display: none;', 
        // Y muestra este contenido en su lugar
        after: {
            contentText: '******',
            color: '#888' // Un color gris para que no distraiga
        }
    });
    ```
2.  **Detectar Archivos Abiertos:** Usa el evento `vscode.window.onDidChangeActiveTextEditor` para ejecutar tu lógica cada vez que el usuario cambie de pestaña.
3.  **Aplicar la Lógica:**
    *   Dentro del evento, obtén el nombre del archivo activo.
    *   Usa `minimatch` para comprobar si el nombre del archivo coincide con alguna de las reglas que leíste del `.hide`.
    *   Si coincide, usa una **Expresión Regular (RegEx)** para encontrar todo el texto que viene después de un signo `=` en cada línea.
    *   Para cada coincidencia, crea un `vscode.Range` que represente su posición en el editor.
    *   Finalmente, aplica la decoración al editor activo usando `editor.setDecorations(OcultarDecoracion, rangosAocultar)`.

---

### **Fase 4: Interactividad y Usabilidad** - Pendiente

**Objetivo:** Hacer que la extensión responda dinámicamente a los cambios del usuario.

**Pasos a Seguir:**

1.  **Vigilar Cambios en `.hide`:** Usa `vscode.workspace.createFileSystemWatcher` para "escuchar" cualquier cambio en el archivo `.hide`.
2.  **Actualizar en Tiempo Real:** Cuando el watcher detecte un cambio (guardado), vuelve a ejecutar la lógica de la Fase 2 (releer el archivo) y la Fase 3 (re-aplicar las decoraciones). Esto permitirá al usuario comentar una línea en `.hide` y ver el contenido del archivo sensible al instante.
3.  **Limpiar Decoraciones:** Asegúrate de que cuando un archivo ya no coincida con las reglas (o cuando se cierre), las decoraciones se eliminen para no afectar el rendimiento. Puedes pasar un array vacío a `editor.setDecorations(OcultarDecoracion, [])`.

---

### **Fase 5: Pulido y Empaquetado** - Todavia no

**Objetivo:** Preparar la extensión para su publicación con un aspecto profesional.

**Pasos a Seguir:**

1.  **Crear un Icono:** Diseña un icono simple (formato `.png`, 128x128 píxeles) para tu extensión y referéncialo en el `package.json`.
2.  **Escribir un Buen README:** Crea un archivo `README.md` claro y conciso. Explica:
    *   ¿Qué problema resuelve la extensión?
    *   ¿Cómo funciona? (Menciona el archivo `.hide`).
    *   Muestra un GIF animado de la extensión en acción. Es la mejor forma de venderla. (Puedes usar herramientas como LICEcap o ScreenToGif).
3.  **Rellenar `package.json`:** Asegúrate de completar todos los campos importantes: `publisher` (tu nombre de editor del marketplace), `repository` (URL de tu repo en GitHub), `keywords`, `categories`, etc.
4.  **Probar Exhaustivamente:** Prueba todos los casos de uso: archivos nuevos, borrar `.hide`, reglas complejas, etc.

---

### **Fase 6: El Lanzamiento - Publicación en el Marketplace** - Todavia no

**Objetivo:** Poner tu extensión a disposición del mundo.

**Pasos a Seguir:**

1.  **Crea una cuenta en Azure DevOps** y un "Publisher" en el [VS Code Marketplace](https://marketplace.visualstudio.com/manage).
2.  **Genera un Personal Access Token (PAT)** desde Azure DevOps con permisos para el Marketplace.
3.  **Inicia Sesión en la Terminal:**
    ```bash
    vsce login <tu-nombre-de-publisher>
    ```
    Te pedirá el PAT que acabas de generar.
4.  **Empaqueta y Publica:**
    ```bash
    # Opcional: crea el archivo .vsix para probarlo o compartirlo de forma privada
    vsce package

    # Publica la extensión en el Marketplace
    vsce publish
    ```
