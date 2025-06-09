// some go horse stuff just to speed up the project

import fs from 'node:fs';
import * as path from 'node:path';

const projectRoot = path.resolve(__dirname, '../../../');
const apiPath = path.join(projectRoot, 'src', 'api');

export function createModule(moduleName: string): void {
  const capitalizedModuleName =
    moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const modulePath = path.join(apiPath, moduleName);
  const modelPath = path.join(modulePath, `${moduleName}Model.ts`);
  const controllerPath = path.join(modulePath, `${moduleName}Controller.ts`);
  const servicePath = path.join(modulePath, `${moduleName}Service.ts`);
  const repositoryPath = path.join(modulePath, `${moduleName}Repository.ts`);
  const routerPath = path.join(modulePath, `${moduleName}Router.ts`);

  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath, { recursive: true });
  }

  if (!fs.existsSync(modelPath)) {
    fs.writeFileSync(
      modelPath,
      `import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';\nimport { z } from 'zod';\n\nextendZodWithOpenApi(z);`
    );
  }
  if (!fs.existsSync(controllerPath)) {
    fs.writeFileSync(
      controllerPath,
      `import ${moduleName}Service from '@/api/${moduleName}/${moduleName}Service';\n\nclass ${capitalizedModuleName}Controller {\n  // Define your controller methods here\n}\n\nexport default new ${capitalizedModuleName}Controller();`
    );
  }
  if (!fs.existsSync(servicePath)) {
    fs.writeFileSync(
      servicePath,
      `import ${moduleName}Repository from '@/api/${moduleName}/${moduleName}Repository';\n\nclass ${capitalizedModuleName}Service {\n  // Define your service methods here\n}\n\nexport default new ${capitalizedModuleName}Service();`
    );
  }
  if (!fs.existsSync(repositoryPath)) {
    fs.writeFileSync(
      repositoryPath,
      `import db from '@/common/db';\n\nclass ${capitalizedModuleName}Repository {\n  // Define your repository queries here\n}\n\nexport default new ${capitalizedModuleName}Repository();`
    );
  }
  if (!fs.existsSync(routerPath)) {
    fs.writeFileSync(
      routerPath,
      `import { Router } from 'express';\nimport { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';\nimport { createApiResponse } from '@/api-docs/openAPIResponseBuilders';\n\nexport const authRouter: Router = Router();\nexport const authRegistry = new OpenAPIRegistry();`
    );
  }

  const testsPath = path.join(modulePath, `__tests__`);
  if (!fs.existsSync(testsPath)) {
    fs.mkdirSync(testsPath, { recursive: true });

    const controllerTestPath = path.join(
      testsPath,
      `${moduleName}Controller.test.ts`
    );
    if (!fs.existsSync(controllerTestPath)) {
      fs.writeFileSync(
        controllerTestPath,
        `import ${moduleName}Controller from '@/api/${moduleName}/${moduleName}Controller';\n\n// Write your controller tests here`
      );
    }

    const serviceTestPath = path.join(
      testsPath,
      `${moduleName}Service.test.ts`
    );
    if (!fs.existsSync(serviceTestPath)) {
      fs.writeFileSync(
        serviceTestPath,
        `import ${moduleName}Service from '@/api/${moduleName}/${moduleName}Service';\n\n// Write your service tests here`
      );
    }

    const routerTestPath = path.join(testsPath, `${moduleName}Router.test.ts`);
    if (!fs.existsSync(routerTestPath)) {
      fs.writeFileSync(
        routerTestPath,
        `import request from "supertest";\n\n// Write your repository tests here`
      );
    }
  }

  console.log(`Module "${moduleName}" created successfully.`);
}
