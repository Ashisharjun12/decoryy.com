
export type PresignedUrlResult = {
    uploadUrl: string;
    key: string;
    // Cloudinary specific fields
    signature?: string;
    timestamp?: number;
    apiKey?: string;
    publicUrl?: string;
  };
  
  export type MultipartUploadStartResult = {
    uploadId: string;
    key: string;
  };
  
  export interface IStorageProvider {
    delete(publicId: string): Promise<void>;
    
    // Presigned & Direct Uploads
    getPresignedUploadUrl?(filename: string, contentType: string): Promise<PresignedUrlResult>;
    getPresignedDownloadUrl?(key: string): Promise<string>;
    
    // Multipart Uploads
    startMultipartUpload?(filename: string, contentType: string): Promise<MultipartUploadStartResult>;
    getMultipartPartUrl?(key: string, uploadId: string, partNumber: number): Promise<string>;
    completeMultipartUpload?(key: string, uploadId: string, parts: any[]): Promise<void>;
  }