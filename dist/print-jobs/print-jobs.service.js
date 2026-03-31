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
var PrintJobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintJobsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const mail_service_1 = require("../mail/mail.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let PrintJobsService = PrintJobsService_1 = class PrintJobsService {
    constructor(supabaseService, mailService, whatsappService) {
        this.supabaseService = supabaseService;
        this.mailService = mailService;
        this.whatsappService = whatsappService;
        this.logger = new common_1.Logger(PrintJobsService_1.name);
    }
    async create(payload, files) {
        this.logger.debug(`Processing new quote request for: ${payload.customerName}`);
        try {
            const orderRecord = await this.supabaseService.createOrder({
                customerName: payload.customerName,
                customerEmail: payload.customerEmail,
                customerPhone: payload.customerPhone,
                status: 'pending_quote',
            });
            const processedItems = await Promise.all(payload.items.map(async (item) => {
                const expectedFieldName = `file_${item.cartItemId}`;
                const matchedFile = files?.find((f) => f.fieldname === expectedFieldName);
                let uploadedFileUrl = null;
                if (matchedFile) {
                    this.logger.debug(`Uploading artwork for item: ${item.productName}`);
                    const uniqueFilename = `${orderRecord.id}/${Date.now()}-${matchedFile.originalname}`;
                    uploadedFileUrl = await this.supabaseService.uploadStorageFile('artwork_bucket', uniqueFilename, matchedFile.buffer, matchedFile.mimetype);
                }
                return {
                    order_id: orderRecord.id,
                    product_id: item.productId,
                    product_name: item.productName,
                    size: item.size,
                    quantity: item.quantity,
                    material: item.material,
                    customer_notes: item.notes,
                    artwork_url: uploadedFileUrl,
                    estimated_price: item.price,
                };
            }));
            await this.supabaseService.insertOrderItems(processedItems);
            this.logger.debug('Order saved. Triggering Mail and WhatsApp notifications...');
            this.mailService
                .sendQuoteRequestInternal(payload, processedItems)
                .catch((e) => this.logger.error(e));
            this.mailService
                .sendQuoteConfirmationToCustomer(payload, processedItems)
                .catch((e) => this.logger.error(e));
            this.whatsappService
                .notifyAdminNewQuote(orderRecord.id, payload.customerName, processedItems)
                .catch((e) => this.logger.error(e));
            return {
                message: 'Order and files processed successfully',
                data: { orderId: orderRecord.id },
            };
        }
        catch (error) {
            this.logger.error(`Failed to process print job: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('An error occurred while saving the project details.');
        }
    }
    async findAllOrders() {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('orders')
            .select(`
      *,
      order_items (*) 
    `)
            .order('created_at', { ascending: false });
        if (error) {
            this.logger.error(`Supabase Fetch Error: ${error.message}`);
            throw new common_1.InternalServerErrorException('Error fetching data from Supabase');
        }
        return data;
    }
};
exports.PrintJobsService = PrintJobsService;
exports.PrintJobsService = PrintJobsService = PrintJobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        mail_service_1.MailService,
        whatsapp_service_1.WhatsappService])
], PrintJobsService);
//# sourceMappingURL=print-jobs.service.js.map