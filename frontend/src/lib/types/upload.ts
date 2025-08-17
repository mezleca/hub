/*
	ID        string `json:"id"`
	FileName  string `json:"file_name"`
	TotalSize int64  `json:"total_size"` // bytes
	Size      int64  `json:"size"`       // bytes
	Status    string `json:"status"`
*/

export enum UploadReason {
    UNKNOWN,
    NO_BUFFER,
    SAME_BUFFER,
};

export type NewUpload = {
    file_name: string;
    size: number; // total size
}

export type Upload = {
    id: string;
    file_name: string;
    total_size: number;
    size: number; // current progress in bytes
    status: string;
    buffer: Blob | undefined;
};

export type UploadResult = {
    success: boolean;
    reason: UploadReason; 
    data: Upload;
};