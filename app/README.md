# App

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.10.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Como rodar esta aplicacao

No projeto atual, o frontend Angular fica em `open/app`.

Para subir e ver as telas:

```powershell
cd C:\Users\ferna\Desenv\eclipse-workspace\open\app
npm start
```

Isso sobe o Angular em:

- `http://localhost:4200`

Como o frontend usa proxy para `/api`, o backend Spring precisa estar rodando em paralelo em `http://localhost:8080`.

Para subir o backend em outro terminal, na raiz do projeto:

```powershell
cd C:\Users\ferna\Desenv\eclipse-workspace\open
.\mvnw.cmd spring-boot:run
```

Se o wrapper der problema no seu ambiente, use Maven instalado:

```powershell
mvn spring-boot:run
```

Fluxo esperado:

1. subir backend na pasta `open`
2. subir frontend na pasta `open/app`
3. abrir `http://localhost:4200`
