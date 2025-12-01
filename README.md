# Ruoteng Li's Personal Portfolio

A modern, responsive personal portfolio website showcasing my research work in Computer Vision and Machine Learning.

## Features

- **Modern Design**: Clean, professional layout with smooth animations
- **Responsive**: Works perfectly on all devices (desktop, tablet, mobile)
- **Dark Mode Support**: Automatically adapts to user's system preferences
- **Interactive Elements**: 
  - Smooth scrolling navigation
  - Publication filtering by category
  - Mobile-friendly hamburger menu
  - Hover effects and animations
- **Performance Optimized**: 
  - Lazy loading for images
  - Debounced scroll events
  - Minimal dependencies

## Technology Stack

- **HTML5**: Semantic markup for better SEO and accessibility
- **CSS3**: Modern styling with CSS variables for easy customization
- **Vanilla JavaScript**: No framework dependencies for optimal performance
- **Font Awesome**: For professional icons
- **Google Fonts**: Inter font for clean typography

## Structure

```
personal-portfolio/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # All styles with CSS variables
├── js/
│   └── main.js        # Interactive functionality
├── images/            # Profile photo and publication images
├── files/             # PDF files for papers
└── README.md          # This file
```

## Customization

### Colors
Edit the CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #2563eb;
    --primary-dark: #1d4ed8;
    --secondary-color: #64748b;
    /* ... more color variables */
}
```

### Content
- Update personal information in `index.html`
- Add new publications in the publications section
- Modify research interests as needed

## Deployment

This site is designed to work with GitHub Pages:

1. Push to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the main branch as the source
4. Your site will be available at `https://[username].github.io/[repository-name]`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

This portfolio template is available for personal use. Please customize it with your own content and styling.

## Contact

Ruoteng Li - liruoteng@gmail.com
