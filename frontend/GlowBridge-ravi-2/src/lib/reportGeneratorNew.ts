import jsPDF from 'jspdf';

export interface ReportFilters {
  reportType: "current-stock" | "stock-usage";
  minPrice: string;
  maxPrice: string;
  stockLevel: "all" | "in-stock" | "low-stock" | "out-of-stock";
  timePeriod: "7" | "14" | "21" | "30" | "60" | "90";
}

export interface ReportItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  discount: number;
  description?: string;
}

export class InventoryReportGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private yPosition: number;
  private lineHeight: number;
  private margin: number;
  private primaryColor: string;
  private lightColor: string;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.yPosition = 20;
    this.lineHeight = 7;
    this.margin = 20;
    this.primaryColor = '#3B82F6';
    this.lightColor = '#EBF4FF';
  }

  private checkPageBreak(additionalSpace: number = 20): void {
    if (this.yPosition > this.pageHeight - 30 - additionalSpace) {
      this.doc.addPage();
      this.yPosition = 20;
      this.addPageHeader();
    }
  }

  private addPageHeader(): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.primaryColor);
    this.doc.text('GlowBridge Salon Management System', this.margin, this.yPosition);
    this.yPosition += 15;
  }

  private addText(text: string, fontSize: number = 10, isBold: boolean = false, color: string = '#000000'): void {
    this.checkPageBreak();
    
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    this.doc.setTextColor(color);
    
    const textLines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    this.doc.text(textLines, this.margin, this.yPosition);
    this.yPosition += textLines.length * this.lineHeight;
  }

  private calculateSoldQuantity(item: ReportItem): number {
    // Simulate sales based on current stock and status
    // In a real application, this would come from your sales/transaction data
    
    // Base sold quantity calculation based on different factors
    let baseSold = 0;
    
    // Higher priced items typically sell less but generate more revenue
    if (item.price > 5000) {
      baseSold = Math.floor(Math.random() * 15) + 5; // 5-20 units
    } else if (item.price > 2000) {
      baseSold = Math.floor(Math.random() * 30) + 15; // 15-45 units
    } else if (item.price > 500) {
      baseSold = Math.floor(Math.random() * 50) + 20; // 20-70 units
    } else {
      baseSold = Math.floor(Math.random() * 80) + 30; // 30-110 units
    }
    
    // Adjust based on current stock status
    if (item.status === 'out-of-stock') {
      // If out of stock, probably sold well
      baseSold += Math.floor(Math.random() * 20) + 30;
    } else if (item.status === 'low-stock') {
      // If low stock, decent sales
      baseSold += Math.floor(Math.random() * 15) + 10;
    }
    
    // Discount factor - higher discount usually means more sales
    if (item.discount > 20) {
      baseSold += Math.floor(Math.random() * 25) + 15;
    } else if (item.discount > 10) {
      baseSold += Math.floor(Math.random() * 15) + 5;
    }
    
    return Math.max(baseSold, 1); // Ensure at least 1 item sold
  }

  private calculateSoldQuantityForPeriod(item: ReportItem, days: number): number {
    const baseSold = this.calculateSoldQuantity(item);
    // Scale based on time period (30 days is base)
    return Math.floor((baseSold * days) / 30);
  }

  private calculateDailySales(item: ReportItem, days: number): number {
    const totalSold = this.calculateSoldQuantityForPeriod(item, days);
    return Math.round((totalSold / days) * 10) / 10; // Round to 1 decimal
  }

  private getReorderStatus(item: ReportItem, days: number): string {
    const dailySales = this.calculateDailySales(item, days);
    const daysUntilStockOut = item.quantity > 0 ? Math.floor(item.quantity / dailySales) : 0;
    
    if (item.status === 'out-of-stock') {
      return 'CRITICAL - Restock immediately';
    } else if (daysUntilStockOut < 7) {
      return 'URGENT - Reorder within 7 days';
    } else if (daysUntilStockOut < 14) {
      return 'HIGH - Reorder within 2 weeks';
    } else if (daysUntilStockOut < 30) {
      return 'MEDIUM - Reorder within a month';
    } else {
      return 'LOW - Stock sufficient for now';
    }
  }

  private getTimePeriodLabel(days: string): string {
    switch(days) {
      case "7": return "Last Week (7 days)";
      case "14": return "Last 2 Weeks (14 days)";
      case "21": return "Last 3 Weeks (21 days)";
      case "30": return "Last Month (30 days)";
      case "60": return "Last 2 Months (60 days)";
      case "90": return "Last 3 Months (90 days)";
      default: return "Last 30 days";
    }
  }

  public generateReport(data: ReportItem[], salonId: string, filters: ReportFilters): void {
    try {
      this.addPageHeader();
      
      const days = parseInt(filters.timePeriod);
      const periodLabel = this.getTimePeriodLabel(filters.timePeriod);
      
      const reportTitle = filters.reportType === 'current-stock' 
        ? 'INVENTORY CURRENT STOCK LEVEL REPORT' 
        : 'INVENTORY SALES & USAGE ANALYSIS REPORT';
      
      this.addText(reportTitle, 16, true, this.primaryColor);
      this.yPosition += 5;
      
      this.addText(`Generated on: ${new Date().toLocaleString()}`, 10);
      this.addText(`Salon ID: ${salonId}`, 10);
      if (filters.reportType === 'stock-usage') {
        this.addText(`Analysis Period: ${periodLabel}`, 10);
      }
      // Include selected price range in the report header/summary when provided
      if (filters.minPrice || filters.maxPrice) {
        const min = filters.minPrice ? parseFloat(filters.minPrice).toFixed(2) : '0.00';
        const max = filters.maxPrice ? parseFloat(filters.maxPrice).toFixed(2) : '\u221E';
        this.addText(`Price Range: Rs.${min} - ${max}`, 10);
      }
      // If the report is for a single selected product, include its name explicitly
      if (data.length === 1) {
        this.addText(`Selected Product: ${data[0].name}`, 10);
      }
      this.yPosition += 10;
      
      this.addText('SUMMARY:', 12, true);
      this.yPosition += 5;
      
      if (filters.reportType === 'current-stock') {
        this.addText(`• Total Items: ${data.length}`);
        this.addText(`• In Stock: ${data.filter(i => i.status === 'in-stock').length}`);
        this.addText(`• Low Stock: ${data.filter(i => i.status === 'low-stock').length}`);
        this.addText(`• Out of Stock: ${data.filter(i => i.status === 'out-of-stock').length}`);
        this.addText(`• Total Value: Rs.${data.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}`);
      } else {
        const highSalesThreshold = days > 30 ? 100 : 50;
        const medSalesMin = days > 30 ? 40 : 20;
        const medSalesMax = days > 30 ? 100 : 50;
        
        this.addText(`• Total Products Monitored: ${data.length}`);
        this.addText(`• High Sales Items (>${highSalesThreshold} sold): ${data.filter(i => this.calculateSoldQuantityForPeriod(i, days) > highSalesThreshold).length}`);
        this.addText(`• Medium Sales Items (${medSalesMin}-${medSalesMax} sold): ${data.filter(i => this.calculateSoldQuantityForPeriod(i, days) >= medSalesMin && this.calculateSoldQuantityForPeriod(i, days) <= medSalesMax).length}`);
        this.addText(`• Low Sales Items (<${medSalesMin} sold): ${data.filter(i => this.calculateSoldQuantityForPeriod(i, days) < medSalesMin).length}`);
        this.addText(`• Total Revenue Generated: Rs.${data.reduce((sum, item) => sum + (this.calculateSoldQuantityForPeriod(item, days) * item.price), 0).toFixed(2)}`);
      }
      
      this.yPosition += 10;
      
      const detailTitle = filters.reportType === 'current-stock' 
        ? 'DETAILED INVENTORY:' 
        : 'DETAILED SALES & USAGE ANALYSIS:';
      this.addText(detailTitle, 12, true);
      this.yPosition += 5;
      
      data.forEach((item, index) => {
        if (this.yPosition > this.pageHeight - 60) {
          this.doc.addPage();
          this.yPosition = 20;
        }
        
        this.addText(`${index + 1}. ${item.name}`, 11, true);
        
        if (filters.reportType === 'current-stock') {
          this.addText(`   Price: Rs.${item.price.toFixed(2)}`);
          this.addText(`   Quantity: ${item.quantity}`);
          this.addText(`   Status: ${item.status.toUpperCase()}`);
          this.addText(`   Discount: ${item.discount}%`);
          this.addText(`   Description: ${item.description || 'N/A'}`);
          this.addText(`   Total Value: Rs.${(item.price * item.quantity).toFixed(2)}`);
        } else {
          // Sales/Usage data
          const soldQuantity = this.calculateSoldQuantityForPeriod(item, days);
          const dailySales = this.calculateDailySales(item, days);
          const revenue = soldQuantity * item.price;
          const reorderStatus = this.getReorderStatus(item, days);
          const daysUntilStockOut = item.quantity > 0 && dailySales > 0 ? Math.floor(item.quantity / dailySales) : 'N/A';
          
          this.addText(`   Current Stock: ${item.quantity} units`);
          this.addText(`   Units Sold (${periodLabel}): ${soldQuantity} units`);
          this.addText(`   Daily Sales Average: ${dailySales} units/day`);
          this.addText(`   Revenue Generated: Rs.${revenue.toFixed(2)}`);
          this.addText(`   Days Until Stock Out: ${daysUntilStockOut}`);
          this.addText(`   Reorder Status: ${reorderStatus}`);
          
          // Add performance indicator (scaled by period)
          let performance = 'Good';
          const performanceThreshold = days > 30 ? 120 : days > 14 ? 80 : 60;
          if (soldQuantity > performanceThreshold) performance = 'Excellent';
          else if (soldQuantity > performanceThreshold * 0.67) performance = 'Very Good';
          else if (soldQuantity > performanceThreshold * 0.33) performance = 'Good';
          else if (soldQuantity > performanceThreshold * 0.17) performance = 'Average';
          else performance = 'Poor';
          
          this.addText(`   Sales Performance: ${performance}`);
        }
        
        this.yPosition += 5;
      });
      
      const reportTypeName = filters.reportType === 'current-stock' ? 'Current_Stock' : 'Stock_Usage';
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `GlowBridge_Inventory_${reportTypeName}_Report_${timestamp}.pdf`;
      
      this.doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error('Failed to generate PDF report');
    }
  }
}