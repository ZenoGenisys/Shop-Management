
# ShopManagement (Frontend)

This project is the Angular frontend for the Shop Management system.

## Development

To start a local development server:

```bash
ng serve
```
Navigate to `http://localhost:4200/`.

## Production Build

To build for production (optimized, minified, AOT, etc.):

```bash
ng build --configuration production
```
The output will be in the `dist/` directory. Serve these static files with a web server (e.g., Nginx, Apache, or Node.js static server).

## Theming

All colors and theme variables are managed in `src/theme.scss`. Do not use hardcoded colors in components or styles; always use the theme variables for consistency and maintainability.

## Linting & Testing

Run lint:
```bash
ng lint
```
Run unit tests:
```bash
ng test
```

## Environment

Configure environment variables in `src/environments/` as needed for API endpoints, etc.

## Further Resources

See [Angular CLI Documentation](https://angular.dev/tools/cli) for more commands and options.
