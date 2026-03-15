# aguad.dev

Modern, monochrome landing page for [aguad.dev](https://aguad.dev)

## 🎨 Design

- **Style**: Minimalist, technological, monochrome (black & white)
- **Colors**: #0a0a0a (bg), #1a1a1a (surface), #ffffff (text), #666666 (muted)
- **Typography**: Inter (sans-serif) + JetBrains Mono (monospace)
- **Animations**: Matrix rain, typewriter effect, scroll reveal

## 🚀 Features

- **Hero Section**: Name, title "CTO @ meat.cl & blackdoor.cl" with typewriter animation
- **Work Section**: Cards for meat.cl and blackdoor.cl with hover effects
- **Blog Section**: Latest 3 posts with summaries
- **About Section**: Bio with GitHub avatar and grayscale hover effect
- **Social Links**: GitHub, Instagram, TikTok
- **Responsive**: Mobile-first design

## 🛠️ Tech Stack

- [Hugo](https://gohugo.io/) - Static site generator
- Vanilla CSS - Custom design system
- Vanilla JS - Animations and interactions
- GitHub Actions - Automated deployment

## 📁 Structure

```
├── assets/
│   ├── css/main.css      # Custom styles with animations
│   └── js/main.js        # Matrix rain, typewriter, scroll reveal
├── layouts/
│   ├── _default/         # Base, single, list templates
│   ├── partials/         # Head, navbar, footer, scripts
│   └── index.html        # Landing page
├── content/
│   ├── posts/            # Blog posts
│   ├── about/            # About page
│   └── _index.md         # Home page content
├── hugo.toml             # Site configuration
└── .github/workflows/    # Deployment automation
```

## 📝 Development

```bash
# Run development server
hugo server -D

# Build for production
hugo --minify
```

## 🌐 Deployment

Automatically deployed to GitHub Pages via GitHub Actions on push to `main`.

---

© 2026 Eduardo Aguad — Built with Hugo ⚡
