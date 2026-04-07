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
var SupabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = SupabaseService_1 = class SupabaseService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SupabaseService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    getClient() {
        return this.supabase;
    }
    async createOrder(data) {
        const { data: order, error } = await this.supabase
            .from('orders')
            .insert({
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            customer_phone: data.customerPhone,
            status: data.status,
        })
            .select()
            .single();
        if (error) {
            this.logger.error(`Supabase createOrder Error: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to create order record in database.');
        }
        return order;
    }
    async uploadStorageFile(bucket, path, fileBuffer, mimetype) {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(path, fileBuffer, {
            contentType: mimetype,
            upsert: true,
        });
        if (error) {
            this.logger.error(`Supabase uploadStorageFile Error: ${error.message}`);
            throw new common_1.InternalServerErrorException(`Failed to upload artwork to bucket: ${bucket}`);
        }
        const { data: publicUrlData } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(path);
        return publicUrlData.publicUrl;
    }
    async insertOrderItems(items) {
        const { data, error } = await this.supabase
            .from('order_items')
            .insert(items)
            .select();
        if (error) {
            this.logger.error(`Supabase insertOrderItems Error: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to save order line items to database.');
        }
        return data;
    }
    async updateOrderStatus(orderId, status) {
        const { data, error } = await this.supabase
            .from('orders')
            .update({ status: status })
            .eq('id', orderId)
            .select()
            .single();
        if (error) {
            this.logger.error(`Supabase updateOrderStatus Error: ${error.message}`);
            throw new Error('Failed to update order status in the database.');
        }
        return data;
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = SupabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map