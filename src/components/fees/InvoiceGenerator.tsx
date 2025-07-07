
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface InvoiceData {
  student: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number?: string;
    email?: string;
    universities?: { name: string };
    courses?: { name: string };
    academic_sessions?: { session_name: string };
  };
  payment: {
    id: number;
    amount_paid: number;
    fee_structure_components: {
      fee_types: { name: string };
      fee_structures: { name: string };
    };
  };
  receiptNumber: string;
}

interface InvoiceGeneratorProps {
  invoiceData: InvoiceData;
  onGenerateInvoice: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  invoiceData,
  onGenerateInvoice
}) => {
  const generateInvoicePDF = () => {
    const { student, payment, receiptNumber } = invoiceData;
    
    // Create a new window for the invoice
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${receiptNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 10px;
              background: #3b82f6;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin: 10px 0;
            }
            .invoice-title {
              font-size: 20px;
              color: #666;
              margin: 5px 0;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin: 30px 0;
            }
            .invoice-info, .student-info {
              flex: 1;
            }
            .invoice-info h3, .student-info h3 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            .details-table th, .details-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .details-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .total-section {
              text-align: right;
              margin: 30px 0;
              font-size: 18px;
            }
            .total-amount {
              font-weight: bold;
              color: #333;
              font-size: 24px;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">RE</div>
            <div class="company-name">Student Management System</div>
            <div class="invoice-title">PAYMENT RECEIPT</div>
          </div>
          
          <div class="invoice-details">
            <div class="invoice-info">
              <h3>Receipt Information</h3>
              <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
              <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> Cash</p>
            </div>
            <div class="student-info">
              <h3>Student Information</h3>
              <p><strong>Name:</strong> ${student.first_name} ${student.last_name}</p>
              <p><strong>Phone:</strong> ${student.phone_number || 'N/A'}</p>
              <p><strong>Email:</strong> ${student.email || 'N/A'}</p>
              <p><strong>University:</strong> ${student.universities?.name || 'N/A'}</p>
              <p><strong>Course:</strong> ${student.courses?.name || 'N/A'}</p>
            </div>
          </div>
          
          <table class="details-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Fee Structure</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${payment.fee_structure_components.fee_types.name}</td>
                <td>${payment.fee_structure_components.fee_structures.name}</td>
                <td>$${payment.amount_paid.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total-section">
            <p>Total Amount Paid: <span class="total-amount">$${payment.amount_paid.toLocaleString()}</span></p>
          </div>
          
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>This is a computer-generated receipt.</p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Print Invoice</button>
            <button onclick="window.close()" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    
    // Trigger the onGenerateInvoice callback
    onGenerateInvoice();
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={generateInvoicePDF}
      className="bg-blue-50 hover:bg-blue-100 border-blue-200"
    >
      <FileText className="h-4 w-4 mr-2" />
      Generate Invoice
    </Button>
  );
};

export default InvoiceGenerator;
