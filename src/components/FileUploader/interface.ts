import { FileUploadProgress } from '../../types';

export interface FileUploaderProps {
  uploading: boolean;
  uploadProgress: FileUploadProgress;
  onCancel: () => void;
} 