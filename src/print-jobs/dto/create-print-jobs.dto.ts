export class CreatePrintJobDto {
  customerEmail: string;
  width: number;
  height: number;
  material: string;
  // The file is handled separately by the interceptor
}
