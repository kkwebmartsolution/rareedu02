import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText } from "lucide-react";

interface StudentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    father_name: string;
    mother_name: string;
    date_of_birth: string;
    university_id: number;
    course_id: number;
    phone_number?: string;
    email?: string;
  } | null;
  onGenerateCOL: () => void;
  isGeneratingCOL?: boolean;
}

export default function StudentSuccessModal({ 
  isOpen, 
  onClose, 
  student, 
  onGenerateCOL,
  isGeneratingCOL = false 
}: StudentSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            Student Form Submitted Successfully
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {student && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Application submitted for:
              </p>
              <p className="font-semibold text-lg">
                {student.first_name} {student.last_name}
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            <Button 
              onClick={onGenerateCOL}
              disabled={isGeneratingCOL}
              className="w-full max-w-xs"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isGeneratingCOL ? 'Generating...' : 'Generate COL Letter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}