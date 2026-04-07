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
    updateStatus(orderId: string, status: string): Promise<{
        message: string;
        data: any;
    }>;
}
