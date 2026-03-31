"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express_1 = require("express");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
        snapshot: true,
    });
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: [
            'https://maximus-web-client.netlify.app',
            'https://maximus-vinyl-wraps-backend.onrender.com',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://[::1]:3000',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');
    const logger = new common_1.Logger();
    logger.debug(`This application is runnning on: ${await app.getUrl()}`, 'Bootstrap');
    logger.log(port);
}
bootstrap();
//# sourceMappingURL=main.js.map