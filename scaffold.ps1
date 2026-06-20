$baseDir = "c:\Documents\Capstone Project\binh-nguyen-wedding-event-management-system-sep490-g83\backend-api"

$dirs = @(
    "prisma",
    "src",
    "src\config",
    "src\controllers",
    "src\services",
    "src\routes",
    "src\middlewares",
    "src\utils",
    "tests"
)
foreach ($dir in $dirs) {
    if (-not (Test-Path "$baseDir\$dir")) {
        New-Item -ItemType Directory -Force -Path "$baseDir\$dir" | Out-Null
    }
}

New-Item -ItemType File -Force -Path "$baseDir\prisma\schema.prisma" -Value "generator client {`n  provider = `"prisma-client-js`"`n}`n`ndatasource db {`n  provider = `"mysql`"`n  url      = env(`"DATABASE_URL`")`n}" | Out-Null

New-Item -ItemType File -Force -Path "$baseDir\src\app.ts" -Value "import express from 'express';`nimport routes from './routes';`n`nconst app = express();`napp.use(express.json());`napp.use('/api/v1', routes);`n`nexport default app;" | Out-Null

New-Item -ItemType File -Force -Path "$baseDir\src\server.ts" -Value "import app from './app';`n`nconst PORT = process.env.PORT || 3000;`napp.listen(PORT, () => {`n  console.log(`"Server running on port `$PORT`");`n});" | Out-Null

New-Item -ItemType File -Force -Path "$baseDir\src\config\database.ts" -Value "import { PrismaClient } from '@prisma/client';`n`nconst prisma = new PrismaClient();`nexport default prisma;" | Out-Null
New-Item -ItemType File -Force -Path "$baseDir\src\config\env.ts" -Value "export const ENV = {`n  PORT: process.env.PORT || 3000,`n  DATABASE_URL: process.env.DATABASE_URL,`n  JWT_SECRET: process.env.JWT_SECRET || 'secret'`n};" | Out-Null

New-Item -ItemType File -Force -Path "$baseDir\src\middlewares\auth.middleware.ts" -Value "import { Request, Response, NextFunction } from 'express';`n`nexport const verifyToken = (req: Request, res: Response, next: NextFunction) => { next(); };`nexport const requireRole = (role: string) => (req: Request, res: Response, next: NextFunction) => { next(); };" | Out-Null
New-Item -ItemType File -Force -Path "$baseDir\src\middlewares\error.middleware.ts" -Value "import { Request, Response, NextFunction } from 'express';`n`nexport const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {};`nexport const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {};" | Out-Null
New-Item -ItemType File -Force -Path "$baseDir\src\middlewares\validation.middleware.ts" -Value "import { Request, Response, NextFunction } from 'express';`n`nexport const validateBody = (schema: any) => (req: Request, res: Response, next: NextFunction) => { next(); };" | Out-Null

New-Item -ItemType File -Force -Path "$baseDir\src\utils\response.ts" -Value "import { Response } from 'express';`n`nexport const sendSuccess = (res: Response, data: any, statusCode = 200, meta = {}) => { res.status(statusCode).json({ success: true, statusCode, data, meta }); };`nexport const sendError = (res: Response, message: string, statusCode = 400, errorDetails = null) => { res.status(statusCode).json({ success: false, statusCode, message, errorDetails }); };" | Out-Null

$domains = @("auth", "user", "catalog", "supplier", "inventory", "policy", "customer", "quotation", "order", "survey", "payment", "settlement", "field", "operations", "attendance", "report")

foreach ($domain in $domains) {
    # Name formatting
    $pascalDomain = (Get-Culture).TextInfo.ToTitleCase($domain)
    $controllerName = "${pascalDomain}Controller"
    $serviceName = "${pascalDomain}Service"
    
    New-Item -ItemType File -Force -Path "$baseDir\src\controllers\${domain}.controller.ts" -Value "import { Request, Response } from 'express';`nimport { ${serviceName} } from '../services/${domain}.service';`n`nexport class ${controllerName} {}" | Out-Null
    New-Item -ItemType File -Force -Path "$baseDir\src\services\${domain}.service.ts" -Value "import prisma from '../config/database';`n`nexport class ${serviceName} {}" | Out-Null
    New-Item -ItemType File -Force -Path "$baseDir\src\routes\${domain}.routes.ts" -Value "import { Router } from 'express';`nimport { ${controllerName} } from '../controllers/${domain}.controller';`n`nconst router = Router();`nexport default router;" | Out-Null
    New-Item -ItemType File -Force -Path "$baseDir\tests\${domain}.test.ts" -Value "describe('${domain} API', () => { it('should work', () => {}); });" | Out-Null
}

$indexRoutes = "import { Router } from 'express';`n"
foreach ($domain in $domains) {
    $camelDomain = $domain.Replace("-","")
    $indexRoutes += "import ${camelDomain}Routes from './${domain}.routes';`n"
}
$indexRoutes += "`nconst router = Router();`n"
foreach ($domain in $domains) {
    $camelDomain = $domain.Replace("-","")
    $indexRoutes += "router.use('/${domain}', ${camelDomain}Routes);`n"
}
$indexRoutes += "`nexport default router;"
New-Item -ItemType File -Force -Path "$baseDir\src\routes\index.ts" -Value $indexRoutes | Out-Null

echo "Scaffolding complete"
