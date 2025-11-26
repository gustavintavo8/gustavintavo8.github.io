# 🚀 Gustavo Sobrado | Engineering Portfolio

> **Ingeniería Informática en Tecnologías de la Información** - Universidad de Oviedo (EPI Gijón).
> Portfolio personal desarrollado con React, TailwindCSS y Motion UI.

## ⚡ Sobre el Proyecto

Este repositorio contiene el código fuente de mi portfolio personal. Diseñado no solo para mostrar mis proyectos, sino para demostrar mis capacidades en **Ingeniería de Software Frontend**, arquitectura de componentes y consumo de APIs.

El objetivo era crear una **Single Page Application (SPA)** inmersiva, con una estética "High-Tech" inspirada en el diseño editorial moderno y el estilo visual de *Lando Norris*, alejándose de las plantillas genéricas.

### 🌐 Live Demo
👉 **[gustavintavo8.github.io](https://gustavintavo8.github.io)**

---

## 🛠️ Tech Stack

El proyecto ha sido construido utilizando un stack moderno y optimizado para rendimiento:

* **Core:** ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)
* **Estilos:** ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
* **Animaciones:** `Framer Motion` (Transiciones complejas y física).
* **Scroll:** `@studio-freight/lenis` (Inercia y suavizado).
* **Datos:** Integración en tiempo real con **GitHub REST API**.
* **Despliegue:** GitHub Pages (CI/CD con GitHub Actions).

---

## ✨ Características Principales

* **⚡ GitHub API Fetching:** Los proyectos mostrados no son estáticos; se obtienen dinámicamente de mi perfil de GitHub. Si actualizo un repo, se actualiza la web.
* **🌊 Smooth Scroll:** Implementación de Lenis para una experiencia de navegación fluida y con "peso".
* **🎨 Diseño Bento Grid:** Layout asimétrico y responsive para la sección de proyectos.
* **🖱️ Cursor Magnético:** Cursor personalizado con físicas de muelle (Spring physics).
* **📱 Diseño Responsive:** Adaptado perfectamente desde móviles hasta pantallas 4K.
* **🎭 Motion UI:** Pantallas de carga, transiciones de entrada y micro-interacciones.

---

## 🔧 Instalación y Despliegue Local

Si quieres clonar y ejecutar este proyecto en tu máquina local:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/gustavintavo8/gustavintavo8.github.io.git](https://github.com/gustavintavo8/gustavintavo8.github.io.git)
    cd gustavintavo8.github.io
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar servidor de desarrollo:**
    ```bash
    npm run dev
    ```

4.  **Construir para producción:**
    ```bash
    npm run build
    ```

---

## 📂 Estructura del Proyecto

```text
src/
├── components/      # Componentes reutilizables (Cursor, Tarjetas...)
├── App.jsx          # Lógica principal y orquestación
├── index.css        # Estilos globales y configuración de Tailwind
└── main.jsx         # Punto de entrada de React
public/
└── tufoto.jpg       # Assets estáticos
