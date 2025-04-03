# aguad.dev - Personal Blog

A personal blog built with Hugo and the Blowfish theme.

## Project Structure

- `content/`: Contains all the blog content
  - `posts/`: Blog posts
  - `about/`: About page
- `themes/blowfish/`: The Blowfish theme (Git submodule)
- `static/`: Static files like images
- `layouts/`: Custom layouts
- `hugo.toml`: Site configuration

## Setup & Development

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) (v0.100.0+)
- Git

### Local Development

1. Clone the repository:
   ```bash
   git clone --recurse-submodules https://github.com/yourusername/aguad.dev.git
   cd aguad.dev
   ```

2. Start the Hugo development server:
   ```bash
   hugo server -D
   ```

3. Visit `http://localhost:1313` in your browser

### Creating New Content

To create a new blog post:
```bash
hugo new content posts/my-new-post/index.md
```

## Deployment

To build the site for production:
```bash
hugo --minify
```

The generated site will be in the `public/` directory, ready to be deployed to any static hosting service.

## License

This project is licensed under the MIT License - see the LICENSE file for details.