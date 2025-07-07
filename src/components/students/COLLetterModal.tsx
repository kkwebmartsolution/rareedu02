
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface COLLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    first_name: string;
    last_name: string;
    id: number;
  } | null;
}

export default function COLLetterModal({ isOpen, onClose, student }: COLLetterModalProps) {
  const generateCOLLetter = () => {
    // This will be implemented later when the design and content are provided
    console.log('Generating COL Letter for student:', student?.id);
    // For now, just show a placeholder
    alert('COL Letter generation will be implemented with the provided design and content.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate COL Letter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Generate COL Letter for{' '}
            <strong>
              {student?.first_name} {student?.last_name}
            </strong>
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={generateCOLLetter}>
              <Download className="h-4 w-4 mr-2" />
              Generate Letter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
