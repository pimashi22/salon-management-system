"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertTriangle, Trash2, CheckCircle } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  type?: "danger" | "success" | "warning"
  confirmText?: string
  cancelText?: string
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-red-500" />
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />
    }
  }

  const getButtonStyle = () => {
    switch (type) {
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white"
      case "success":
        return "bg-green-500 hover:bg-green-600 text-white"
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 text-white"
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} className={`flex-1 ${getButtonStyle()}`}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
