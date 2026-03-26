"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintJobsModule = void 0;
const common_1 = require("@nestjs/common");
const print_jobs_service_1 = require("./print-jobs.service");
const print_jobs_controller_1 = require("./print-jobs.controller");
const supabase_module_1 = require("../supabase/supabase.module");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const mail_service_1 = require("../mail/mail.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
const handlebars_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/handlebars.adapter");
const path_1 = require("path");
let PrintJobsModule = class PrintJobsModule {
};
exports.PrintJobsModule = PrintJobsModule;
exports.PrintJobsModule = PrintJobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            supabase_module_1.SupabaseModule,
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (config) => ({
                    transport: {
                        host: config.get('SMTP_HOST'),
                        port: config.get('SMTP_PORT'),
                        secure: false,
                        auth: {
                            user: config.get('SMTP_USER'),
                            pass: config.get('SMTP_PASSWORD'),
                        },
                    },
                    defaults: {
                        from: config.get('EMAIL_FROM'),
                    },
                    template: {
                        dir: (0, path_1.join)(__dirname, 'templates'),
                        adapter: new handlebars_adapter_1.HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [print_jobs_controller_1.PrintJobsController],
        providers: [print_jobs_service_1.PrintJobsService, mail_service_1.MailService, whatsapp_service_1.WhatsappService],
        exports: [mail_service_1.MailService, whatsapp_service_1.WhatsappService],
    })
], PrintJobsModule);
//# sourceMappingURL=print-jobs.module.js.map