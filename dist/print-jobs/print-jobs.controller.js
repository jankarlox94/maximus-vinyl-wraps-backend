"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PrintJobsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintJobsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const print_jobs_service_1 = require("./print-jobs.service");
let PrintJobsController = PrintJobsController_1 = class PrintJobsController {
    constructor(printJobsService) {
        this.printJobsService = printJobsService;
        this.logger = new common_1.Logger(PrintJobsController_1.name);
    }
    async create(body, files) {
        this.logger.debug(`Incoming print job request received.`);
        const MAX_SIZE = 8 * 1024 * 1024;
        const ALLOWED_TYPES = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'application/pdf',
        ];
        if (files && files.length > 0) {
            for (const file of files) {
                if (file.size > MAX_SIZE) {
                    this.logger.debug(`File ${file.originalname} exceeds the 8MB limit.`);
                    throw new common_1.BadRequestException(`File ${file.originalname} exceeds the 8MB limit.`);
                }
                if (!ALLOWED_TYPES.includes(file.mimetype)) {
                    this.logger.debug(`File ${file.originalname} has an invalid type. Only PNG, JPEG,PJG and PDF are allowed.`);
                    throw new common_1.BadRequestException(`File ${file.originalname} has an invalid type. Only PNG, JPEG, JPG, and PDF are allowed.`);
                }
            }
        }
        try {
            const cartItems = body.cartData ? JSON.parse(body.cartData) : [];
            const printJobPayload = {
                customerName: body.customerName,
                customerEmail: body.customerEmail,
                customerPhone: body.customerPhone,
                isCustomDesign: body.isCustomDesign,
                items: cartItems,
            };
            return await this.printJobsService.create(printJobPayload, files);
        }
        catch (e) {
            this.logger.error(`error in catcher${e}`);
            this.logger.error(`Failed to parse order payload: ${e.message}`, e.stack);
            throw new common_1.BadRequestException('Invalid payload data or malformed JSON.');
        }
    }
    async getAdminDashboard() {
        this.logger.debug('Admin dashboard data requested.');
        try {
            return await this.printJobsService.findAllOrders();
        }
        catch (e) {
            this.logger.error(`Failed to fetch dashboard data: ${e.message}`);
            throw new common_1.InternalServerErrorException('Could not retrieve orders.');
        }
    }
    async updateStatus(orderId, status) {
        this.logger.debug(`Received request to update order ${orderId} to status: ${status}`);
        if (!status) {
            throw new common_1.BadRequestException('A new status must be provided.');
        }
        return await this.printJobsService.updateStatus(orderId, status);
    }
    async updatePayment(id, is_paid, pay_comments) {
        return this.printJobsService.updatePaymentStatus(id, is_paid, pay_comments);
    }
};
exports.PrintJobsController = PrintJobsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], PrintJobsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin/dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrintJobsController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PrintJobsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('is_paid')),
    __param(2, (0, common_1.Body)('pay_comments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, String]),
    __metadata("design:returntype", Promise)
], PrintJobsController.prototype, "updatePayment", null);
exports.PrintJobsController = PrintJobsController = PrintJobsController_1 = __decorate([
    (0, common_1.Controller)('print-jobs'),
    __metadata("design:paramtypes", [print_jobs_service_1.PrintJobsService])
], PrintJobsController);
//# sourceMappingURL=print-jobs.controller.js.map