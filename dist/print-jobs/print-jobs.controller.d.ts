import { PrintJobsService } from './print-jobs.service';
export declare class PrintJobsController {
    private readonly printJobsService;
    private readonly logger;
    constructor(printJobsService: PrintJobsService);
    create(body: any, files: Array<Express.Multer.File>): Promise<{
        message: string;
        data: {
            orderId: any;
        };
    }>;
    getAdminDashboard(): Promise<any[]>;
    getOrders(orderNumberQuery?: string): Promise<any[]>;
    updateStatus(orderId: string, status: string): Promise<{
        message: string;
        data: any;
    }>;
    updatePayment(id: string, is_paid: boolean, pay_comments: string): Promise<{
        message: string;
        data: any;
    }>;
}
